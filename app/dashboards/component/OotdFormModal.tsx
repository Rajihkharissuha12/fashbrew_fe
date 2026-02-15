"use client";

import React, { useEffect, useRef, useState } from "react";
import TagInput from "./TagInput";
import ConfirmDialog from "./ConfirmDialog";

type Mode = "create" | "update";

type ProductPick = {
  productId: string;
  name?: string;
  note?: string;
  position?: number;
};

type MediaItem = {
  id?: string;
  type: "image" | "video";
  url: string;
  isPrimary: boolean;
  isDeleted?: boolean;
};

export interface OotdInput {
  userId?: string;
  title: string;
  description?: string;
  urlPostInstagram?: string;
  mood?: string[];
  isPublic?: boolean;
  products: Array<{ id: string; note?: string; position?: number }>;
  media?: Array<{
    type: "image" | "video";
    url: string;
    isPrimary: boolean;
  }>;
  deleteMediaIds?: string[];
}

export interface OotdDTO extends OotdInput {
  id: string;
  viewCount: number;
  likeCount: number;
  createdAt?: string;
  updatedAt?: string;
  media?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    isPrimary: boolean;
  }>;
  ootdProducts?: Array<{
    id: string;
    productId: string;
    note?: string | null;
    position?: number | null;
    product?: { id: string; name: string };
  }>;
}

interface OotdFormModalProps {
  open: boolean;
  onClose: () => void;
  mode?: Mode;
  initialData?: OotdDTO | null;
  defaultInfluencerId?: string;
  onSuccess?: (result: any) => void;
  apiBaseUrl?: string;
}

type MediaFile = {
  file: File;
  preview: string;
  type: "image" | "video";
};

const OotdFormModal: React.FC<OotdFormModalProps> = ({
  open,
  onClose,
  mode = "create",
  initialData = null,
  defaultInfluencerId = "",
  onSuccess,
  apiBaseUrl = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [productActionLoading, setProductActionLoading] = useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);

  // fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [urlPostInstagram, setUrlPostInstagram] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [moodTags, setMoodTags] = useState<string[]>([]);

  // Media management - HANYA UNTUK UPDATE
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState<string>("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string>("");

  // ✅ NEW: File upload states
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // daftar produk yang terhubung (1 produk bisa buat banyak OOTD)
  const [items, setItems] = useState<ProductPick[]>([]);

  // sumber produk untuk dropdown
  const [productsLoading, setProductsLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string>("");

  // editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState<string>("");

  // Confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdate = mode === "update";
  const ootdId = initialData?.id || "";
  console.log("PRODUCT", initialData);

  function resetForm() {
    setTitle("");
    setDescription("");
    setUrlPostInstagram("");
    setIsPublic(true);
    setMoodTags([]);
    setMediaItems([]);
    setNewMediaUrl("");
    setNewMediaType("image");
    setItems([]);
    setSelectedToAdd("");
    setEditingNoteId(null);
    setEditingNoteValue("");
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setUploadProgress(0);
  }

  /**
   * Handle file selection
   */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    console.log("Files selected:", files.length); // Debug log

    if (files.length === 0) {
      console.log("No files selected");
      return;
    }

    // Validasi: max 4 media total
    const currentCount = isUpdate
      ? mediaItems.filter((m) => !m.isDeleted).length
      : 0;
    const newCount = currentCount + selectedFiles.length + files.length;

    if (newCount > 4) {
      alert(
        `Maksimal 4 media. Saat ini: ${currentCount} uploaded + ${selectedFiles.length} pending + ${files.length} baru = ${newCount} total`
      );
      e.target.value = ""; // Reset input
      return;
    }

    // Validasi file type dan size
    const validFiles: MediaFile[] = [];

    for (const file of files) {
      console.log("Processing file:", file.name, file.type, file.size);

      // Check type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        alert(`File ${file.name} bukan image atau video`);
        continue;
      }

      // Check size (max 10MB for images, 50MB for videos)
      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `File ${file.name} terlalu besar (max ${isImage ? "10MB" : "50MB"})`
        );
        continue;
      }

      // ✅ Create preview URL
      try {
        const preview = URL.createObjectURL(file);
        console.log("Preview created for:", file.name, preview);

        validFiles.push({
          file,
          preview,
          type: isImage ? "image" : "video",
        });
      } catch (err) {
        console.error("Failed to create preview for:", file.name, err);
        alert(`Gagal membuat preview untuk ${file.name}`);
      }
    }

    if (validFiles.length > 0) {
      console.log("Adding valid files:", validFiles.length);
      setSelectedFiles((prev) => {
        const updated = [...prev, ...validFiles];
        console.log("Updated selected files:", updated.length);
        return updated;
      });
    } else {
      console.log("No valid files to add");
    }

    // Reset input value
    e.target.value = "";
  }

  /**
   * Remove selected file before upload
   */
  function removeSelectedFile(index: number) {
    console.log("Removing file at index:", index);

    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles[index];

      // Revoke object URL to free memory
      try {
        URL.revokeObjectURL(removed.preview);
        console.log("Preview URL revoked for:", removed.file.name);
      } catch (err) {
        console.error("Failed to revoke URL:", err);
      }

      newFiles.splice(index, 1);
      console.log("Files after removal:", newFiles.length);
      return newFiles;
    });
  }

  /**
   * Upload files to server (only for UPDATE mode)
   */
  async function uploadMediaFiles() {
    console.log("uploadMediaFiles called");
    console.log("isUpdate:", isUpdate);
    console.log("ootdId:", ootdId);
    console.log("selectedFiles.length:", selectedFiles.length);

    if (!isUpdate || !ootdId) {
      alert("Upload media hanya tersedia saat edit OOTD");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    try {
      setMediaUploadLoading(true);
      setUploadProgress(0);

      const formData = new FormData();

      // Append all files
      selectedFiles.forEach((mediaFile, idx) => {
        console.log(`Appending file ${idx}:`, mediaFile.file.name);
        formData.append("photos", mediaFile.file);
      });

      // Append metadata
      formData.append("type", "media");
      formData.append("isPrimary", "false");

      const url = `${apiBaseUrl}/api/ootds/${ootdId}/media`;
      console.log("Uploading to:", url);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          console.log("Upload progress:", percentComplete + "%");
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          console.log("Upload complete. Status:", xhr.status);
          console.log("Response:", xhr.responseText);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (err) {
              console.error("Failed to parse response:", err);
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          console.error("Network error");
          reject(new Error("Network error"));
        };

        xhr.ontimeout = () => {
          console.error("Upload timeout");
          reject(new Error("Upload timeout"));
        };

        xhr.open("POST", url);
        xhr.timeout = 120000; // 2 minutes timeout
        xhr.send(formData);
      });

      const result = await uploadPromise;

      console.log("Upload success:", result);

      // Handle response
      const uploadData = result.data || result;

      if (uploadData?.uploaded && Array.isArray(uploadData.uploaded)) {
        const newMediaItems = uploadData.uploaded.map((m: any) => ({
          id: undefined,
          type: m.type as "image" | "video",
          url: m.url,
          isPrimary: m.isPrimary || false,
          isDeleted: false,
        }));

        console.log("Adding media items:", newMediaItems);
        setMediaItems((prev) => [...prev, ...newMediaItems]);
      }

      // Clear selected files and cleanup URLs
      console.log("Cleaning up selected files");
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);
      setUploadProgress(0);

      alert(
        `${uploadData?.count || selectedFiles.length} file berhasil diupload!`
      );

      // Show errors if any
      if (uploadData?.errors && uploadData.errors.length > 0) {
        console.warn("Some files failed:", uploadData.errors);
        const errorMsg = uploadData.errors
          .map((e: any) => `${e.filename}: ${e.error}`)
          .join("\n");
        alert(`Beberapa file gagal:\n${errorMsg}`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Gagal upload: ${error.message || "Unknown error"}`);
    } finally {
      setMediaUploadLoading(false);
      setUploadProgress(0);
    }
  }

  function triggerFileInput() {
    console.log("Triggering file input");
    fileInputRef.current?.click();
  }

  // ✅ FIXED: Cleanup with proper dependency
  useEffect(() => {
    return () => {
      // Cleanup all preview URLs when component unmounts
      selectedFiles.forEach((f) => {
        try {
          URL.revokeObjectURL(f.preview);
        } catch (err) {
          console.error("Failed to revoke URL:", err);
        }
      });
    };
  }, [selectedFiles]); // ✅ Add dependency

  function initFromInitialData(o: OotdDTO) {
    setTitle(o.title || "");
    setDescription(o.description || "");
    setUrlPostInstagram(o.urlPostInstagram || "");
    setIsPublic(o.isPublic ?? true);

    // Parse mood
    if (Array.isArray(o.mood)) {
      setMoodTags(o.mood as string[]);
    } else {
      setMoodTags([]);
    }

    // Load existing media HANYA UNTUK UPDATE
    if (isUpdate && Array.isArray(o.media)) {
      setMediaItems(
        o.media.map((m) => ({
          id: m.id,
          type: m.type as "image" | "video",
          url: m.url,
          isPrimary: m.isPrimary,
          isDeleted: false,
        }))
      );
    } else {
      setMediaItems([]);
    }

    // Load products - 1 produk bisa buat banyak OOTD
    setItems(
      Array.isArray(o.ootdProducts)
        ? o.ootdProducts
            .map((op) => ({
              productId: String(op.productId),
              name: op.product?.name,
              note: op.note ?? "",
              position: op.position ?? 0,
            }))
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        : []
    );
    setSelectedToAdd("");
  }

  useEffect(() => {
    if (!open) return;
    if (initialData && isUpdate) initFromInitialData(initialData);
    else resetForm();
  }, [open, initialData, mode]);

  // fetch product options
  useEffect(() => {
    async function loadProducts() {
      if (!open) return;
      setProductsLoading(true);
      try {
        console.log("Loading products with influencerId:", defaultInfluencerId);
        const qs = new URLSearchParams();
        if (defaultInfluencerId) qs.set("influencerId", defaultInfluencerId);
        qs.set("page", "1");
        qs.set("pageSize", "100");

        const url = `${apiBaseUrl}/api/products?${qs.toString()}`;
        console.log("Fetching from:", url);

        const res = await fetch(url, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Response not ok:", res.status, await res.text());
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        console.log("Products response:", json);

        const list = (json.items || json.data || []).map((p: any) => ({
          id: String(p.id),
          name: String(p.name),
        }));

        console.log("Processed products:", list);
        setProductOptions(list);
      } catch (e) {
        console.error("Product loading error:", e);
        setProductOptions([]);
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, [open, apiBaseUrl, defaultInfluencerId]);

  // ============= MEDIA MANAGEMENT - HANYA UNTUK UPDATE =============

  function addMedia() {
    if (!newMediaUrl.trim()) {
      alert("URL media tidak boleh kosong");
      return;
    }

    const isPrimary = mediaItems.filter((m) => !m.isDeleted).length === 0;

    setMediaItems((prev) => [
      ...prev,
      {
        type: newMediaType,
        url: newMediaUrl,
        isPrimary,
        isDeleted: false,
      },
    ]);

    setNewMediaUrl("");
    setNewMediaType("image");
  }

  function removeMedia(index: number) {
    const media = mediaItems[index];

    if (media.id) {
      // Jika media dari database, mark untuk dihapus
      setMediaItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, isDeleted: true } : item
        )
      );
    } else {
      // Jika media baru, hapus langsung
      setMediaItems((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function setPrimaryMedia(index: number) {
    setMediaItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index && !item.isDeleted,
      }))
    );
  }

  function restoreMedia(index: number) {
    setMediaItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDeleted: false } : item
      )
    );
  }

  async function deleteMediaApi(baseurl: string, id: string) {
    console.log("DELETING media", baseurl, id);
    const res = await fetch(`${baseurl}/api/ootds/media/${id}`, {
      method: "DELETE",
    });
    // Jika backend terpisah:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Gagal menghapus media");
    }
    return res.json();
  }

  async function handleDeleteMediaPermanent(mediaId: string) {
    try {
      setDeletingId(mediaId);
      await deleteMediaApi(apiBaseUrl, mediaId);

      // Hapus dari UI
      setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));

      alert("Media berhasil dihapus");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus media");
    } finally {
      setDeletingId(null);
    }
  }

  // ============= PRODUCT MANAGEMENT - REUSABLE =============

  async function addSelectedProduct() {
    if (!selectedToAdd) {
      alert("Pilih produk terlebih dahulu");
      return;
    }

    if (items.some((x) => x.productId === selectedToAdd)) {
      alert("Produk sudah ada dalam daftar");
      return;
    }

    const found = productOptions.find((p) => p.id === selectedToAdd);
    if (!found) {
      alert("Produk tidak ditemukan");
      return;
    }

    // Jika UPDATE mode, langsung call API
    if (isUpdate && ootdId) {
      try {
        setProductActionLoading(true);

        const newPosition =
          items.length > 0
            ? Math.max(...items.map((i) => i.position ?? 0)) + 1
            : 1;

        const payload = {
          productId: selectedToAdd,
          note: "",
          position: newPosition,
        };

        console.log("Attaching product via API:", payload);

        const res = await fetch(`${apiBaseUrl}/api/ootds/${ootdId}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Gagal menambahkan produk");
        }

        const result = await res.json();
        console.log("Product attached:", result);

        // Update local state dengan data dari server
        const newItem: ProductPick = {
          productId: selectedToAdd,
          name: found.name,
          note: "",
          position: newPosition,
        };

        setItems((prev) => [...prev, newItem]);
        setSelectedToAdd("");

        alert("Produk berhasil ditambahkan");
      } catch (error: any) {
        console.error("Error attaching product:", error);
        alert(`Gagal menambahkan produk: ${error.message}`);
      } finally {
        setProductActionLoading(false);
      }
    } else {
      // CREATE mode - tambah ke local state saja
      const newPosition =
        items.length > 0
          ? Math.max(...items.map((i) => i.position ?? 0)) + 1
          : 1;

      const newItem: ProductPick = {
        productId: selectedToAdd,
        name: found.name,
        note: "",
        position: newPosition,
      };

      setItems((prev) => [...prev, newItem]);
      setSelectedToAdd("");
    }
  }

  async function removeProduct(productId: string) {
    const confirmDelete = confirm(
      "Yakin ingin menghapus produk ini dari OOTD?"
    );
    if (!confirmDelete) return;

    // Jika UPDATE mode, call API untuk detach
    if (isUpdate && ootdId) {
      try {
        setProductActionLoading(true);

        console.log("Detaching product via API:", productId);

        const res = await fetch(
          `${apiBaseUrl}/api/ootds/${ootdId}/products/${productId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Gagal menghapus produk");
        }

        console.log("Product detached successfully");

        // Update local state - reorder positions
        setItems((prev) => {
          const filtered = prev.filter((x) => x.productId !== productId);
          return filtered.map((item, index) => ({
            ...item,
            position: index + 1,
          }));
        });

        alert("Produk berhasil dihapus");
      } catch (error: any) {
        console.error("Error detaching product:", error);
        alert(`Gagal menghapus produk: ${error.message}`);
      } finally {
        setProductActionLoading(false);
      }
    } else {
      // CREATE mode - hapus dari local state
      setItems((prev) => {
        const filtered = prev.filter((x) => x.productId !== productId);
        return filtered.map((item, index) => ({
          ...item,
          position: index + 1,
        }));
      });
    }
  }

  async function moveProduct(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];

    // Update positions
    const reordered = newItems.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setItems(reordered);

    // Jika UPDATE mode, sync ke backend
    if (isUpdate && ootdId) {
      try {
        // Bisa implement batch update positions API
        // Untuk sekarang, cukup update local state dulu
        console.log("Product reordered (sync to backend not implemented yet)");
      } catch (error) {
        console.error("Error reordering:", error);
      }
    }
  }

  function moveProductUp(index: number) {
    moveProduct(index, "up");
  }

  function moveProductDown(index: number) {
    moveProduct(index, "down");
  }

  function startEditingNote(productId: string, currentNote: string) {
    setEditingNoteId(productId);
    setEditingNoteValue(currentNote || "");
  }

  async function saveEditingNote(productId: string) {
    const newNote = editingNoteValue.trim();

    // Jika UPDATE mode dan ada perubahan, call API
    if (isUpdate && ootdId) {
      try {
        const currentItem = items.find((i) => i.productId === productId);
        if (!currentItem || currentItem.note === newNote) {
          // Tidak ada perubahan
          setEditingNoteId(null);
          return;
        }

        setProductActionLoading(true);

        const payload = {
          productId: productId,
          note: newNote || null,
          position: currentItem.position,
        };

        console.log("Updating product note via API:", payload);

        const res = await fetch(`${apiBaseUrl}/api/ootds/${ootdId}/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Gagal mengupdate catatan");
        }

        console.log("Product note updated successfully");

        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, note: newNote } : item
          )
        );

        setEditingNoteId(null);
        setEditingNoteValue("");
      } catch (error: any) {
        console.error("Error updating note:", error);
        alert(`Gagal mengupdate catatan: ${error.message}`);
      } finally {
        setProductActionLoading(false);
      }
    } else {
      // CREATE mode - update local state
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, note: newNote } : item
        )
      );
      setEditingNoteId(null);
      setEditingNoteValue("");
    }
  }

  // ============= BUILD PAYLOAD =============
  // Sesuaikan dengan format JSON yang diminta
  function buildPayload(): OotdInput {
    const products = items.map((it) => ({
      id: it.productId,
      note: it.note || "",
      position: it.position ?? 0,
    }));

    const activeMedia = mediaItems.filter((m) => !m.isDeleted);
    const media =
      isUpdate && activeMedia.length > 0
        ? activeMedia.map((m) => ({
            type: m.type as "image" | "video",
            url: m.url,
            isPrimary: m.isPrimary,
          }))
        : undefined;

    const deleteMediaIds = isUpdate
      ? mediaItems.filter((m) => m.isDeleted && m.id).map((m) => m.id!)
      : undefined;

    const payload: OotdInput = {
      title,
      description: description || undefined,
      urlPostInstagram: urlPostInstagram || undefined,
      mood: moodTags.length > 0 ? moodTags : undefined,
      isPublic,
      products: isUpdate ? [] : products, // Untuk CREATE: kirim products. Untuk UPDATE: kosongkan (sudah via API)
      media,
      deleteMediaIds,
    };

    if (!isUpdate) {
      payload.userId = defaultInfluencerId || undefined;
    }

    return payload;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // ✅ Check all loading states
    if (loading || productActionLoading || mediaUploadLoading) {
      console.log("Submit blocked: loading in progress");
      return;
    }

    if (!title.trim()) {
      alert("Title wajib diisi");
      return;
    }

    // ✅ Check pending files
    if (selectedFiles.length > 0) {
      alert(
        "Masih ada file yang belum diupload. Klik 'Upload Files' terlebih dahulu."
      );
      return;
    }

    // ✅ Validate media for UPDATE mode
    if (isUpdate) {
      const activeMedia = mediaItems.filter((m) => !m.isDeleted);
      if (activeMedia.length === 0) {
        alert("Minimal harus ada 1 media untuk OOTD");
        return;
      }
    }

    const payload = buildPayload();
    console.log("Submitting payload:", payload);

    try {
      setLoading(true);
      let res: Response;

      if (isUpdate) {
        if (!ootdId) {
          alert("ID OOTD tidak ditemukan untuk update");
          return;
        }
        console.log("UPDATE OOTD WITH ID", ootdId);
        res = await fetch(`${apiBaseUrl}/api/ootds/${ootdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiBaseUrl}/api/ootds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseText = await res.text();
      console.log("Response:", responseText);

      const data = JSON.parse(responseText);
      console.log("Success:", data);

      // ✅ Cleanup before close
      resetForm();
      onSuccess?.(data);
      onClose();
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const activeMediaCount = mediaItems.filter((m) => !m.isDeleted).length;
  const deletedMediaCount = mediaItems.filter((m) => m.isDeleted).length;
  const totalMediaCount = activeMediaCount + selectedFiles.length;

  // ✅ Check if form is ready to submit
  const canSubmit =
    !loading &&
    !productActionLoading &&
    !mediaUploadLoading &&
    selectedFiles.length === 0 &&
    title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="w-full max-w-full sm:max-w-3xl md:max-w-4xl bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-bold">
            {isUpdate ? "Update OOTD" : "Tambah OOTD Baru"}
          </h3>
          <button
            onClick={onClose}
            disabled={loading || productActionLoading || mediaUploadLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm sm:text-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Summer Vibes OOTD"
              required
            />
          </div>

          {/* URL Instagram */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Link Instagram Post
              </label>
              <input
                type="url"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm sm:text-base"
                value={urlPostInstagram}
                onChange={(e) => setUrlPostInstagram(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm sm:text-base"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang OOTD ini..."
            />
          </div>

          {/* Media Section - HANYA UNTUK UPDATE */}
          {isUpdate && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium mb-3">
                Media (Foto/Video)
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  ({activeMediaCount} uploaded, {selectedFiles.length} pending,
                  max 4 total)
                </span>
              </label>

              {/* File Input */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={mediaUploadLoading || totalMediaCount >= 4}
                />

                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={mediaUploadLoading || totalMediaCount >= 4}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="text-gray-600">
                      <svg
                        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium text-blue-600">
                        Klik untuk pilih file
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP, MP4 (max 10MB gambar, 50MB video)
                    </p>
                  </div>
                </button>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">
                      📁 File Terpilih ({selectedFiles.length})
                    </h4>
                    <button
                      type="button"
                      onClick={uploadMediaFiles}
                      disabled={mediaUploadLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {mediaUploadLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading... {uploadProgress}%
                        </span>
                      ) : (
                        "📤 Upload Files"
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {mediaUploadLoading && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Files Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedFiles.map((mediaFile, index) => (
                      <div
                        key={`${mediaFile.file.name}-${index}`}
                        className="relative rounded-lg overflow-hidden border-2 border-blue-300 hover:shadow-lg transition-all"
                      >
                        {/* Preview */}
                        <div className="aspect-square bg-gray-100">
                          {mediaFile.type === "video" ? (
                            <video
                              src={mediaFile.preview}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Video preview error:",
                                  mediaFile.file.name
                                );
                              }}
                            />
                          ) : (
                            <img
                              src={mediaFile.preview}
                              alt={mediaFile.file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Image preview error:",
                                  mediaFile.file.name
                                );
                              }}
                            />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate">
                            {mediaFile.file.name}
                          </p>
                          <p className="text-xs text-gray-300">
                            {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Remove Button */}
                        {!mediaUploadLoading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Remove button clicked for:", index);
                              removeSelectedFile(index);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {mediaFile.type === "video" ? "🎥" : "🖼️"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-blue-700 mt-3">
                    ℹ️ Klik tombol &quot;Upload Files&quot; untuk mengupload
                    file ke server
                  </p>
                </div>
              )}

              {/* Media Grid */}
              {mediaItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Belum ada media. Tambahkan media di atas.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((media, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden border-2 ${
                        media.isDeleted
                          ? "border-red-300 opacity-50"
                          : media.isPrimary
                          ? "border-blue-500"
                          : "border-gray-200"
                      } hover:shadow-lg transition-all`}
                    >
                      {/* Media Preview */}
                      <div className="aspect-square bg-gray-100">
                        {media.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center bg-black text-white">
                            <svg
                              className="w-12 h-12"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Error loading</div>';
                            }}
                          />
                        )}
                      </div>

                      {/* Badges */}
                      {media.isPrimary && !media.isDeleted && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ⭐ Utama
                        </div>
                      )}

                      {media.isDeleted && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          🗑️ Akan Dihapus
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        {media.isDeleted ? (
                          <button
                            type="button"
                            onClick={() => restoreMedia(index)}
                            className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                          >
                            ↩️ Restore
                          </button>
                        ) : (
                          <div className="flex gap-1">
                            {!media.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryMedia(index)}
                                className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                                title="Jadikan utama"
                              >
                                ⭐
                              </button>
                            )}
                            {media.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirm(true);
                                  setMediaId(media.id!);
                                }}
                                disabled={deletingId === media.id}
                                className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium disabled:opacity-50"
                                title="Hapus permanen"
                              >
                                {deletingId === media.id
                                  ? "Menghapus..."
                                  : "🗑️ Hapus"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium"
                                title="Hapus"
                              >
                                🗑️ Hapus
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {deletedMediaCount > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {deletedMediaCount} media akan dihapus permanen saat Anda
                  menyimpan
                </div>
              )}
            </div>
          )}

          {/* Sisa form tidak diubah tapi diberi responsive spacing */}
          <div className="space-y-4 sm:space-y-6">
            {/* Mood Tags */}
            <label className="block text-sm font-medium mb-2">
              Mood Tags
              <span className="text-xs text-gray-500 ml-2 font-normal">
                (Ketik satu kata lalu Enter)
              </span>
            </label>
            <TagInput
              tags={moodTags}
              onChange={setMoodTags}
              placeholder="Contoh: casual, elegant, summer"
            />

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={String(isPublic)}
                onChange={(e) => setIsPublic(e.target.value === "true")}
              >
                <option value="true">Publik</option>
                <option value="false">Private</option>
              </select>
            </div>
          </div>

          {/* Products Section - SELALU ADA (CREATE & UPDATE) */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-3">
              Produk yang Digunakan ({items.length})
              {productActionLoading && (
                <span className="ml-2 text-xs text-blue-600 animate-pulse">
                  ⏳ Memproses...
                </span>
              )}
            </label>

            {/* Add Product Dropdown */}
            <div className="flex gap-2 mb-4">
              <select
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                disabled={
                  productsLoading ||
                  productOptions.length === 0 ||
                  productActionLoading
                }
              >
                <option value="">
                  {productsLoading
                    ? "Memuat produk..."
                    : productOptions.length === 0
                    ? "Tidak ada produk tersedia"
                    : "Pilih produk..."}
                </option>
                {productOptions
                  .filter((p) => !items.some((i) => i.productId === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                onClick={addSelectedProduct}
                disabled={
                  !selectedToAdd || productsLoading || productActionLoading
                }
              >
                {productActionLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </span>
                ) : (
                  "+ Tambah"
                )}
              </button>
            </div>

            {/* Product List */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  Belum ada produk. Pilih produk di atas untuk menambahkan.
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.productId}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Position & Move Buttons */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                          {item.position}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveProductUp(index)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke atas"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProductDown(index)}
                          disabled={index === items.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke bawah"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-2">
                          {item.name || item.productId}
                        </p>

                        {/* Note Editor */}
                        {editingNoteId === item.productId ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingNoteValue}
                              onChange={(e) =>
                                setEditingNoteValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveEditingNote(item.productId);
                                } else if (e.key === "Escape") {
                                  setEditingNoteId(null);
                                }
                              }}
                              placeholder="Tambahkan catatan..."
                              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveEditingNote(item.productId)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              startEditingNote(item.productId, item.note || "")
                            }
                            className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"
                          >
                            {item.note ? (
                              <span>💬 {item.note}</span>
                            ) : (
                              <span className="text-gray-400 italic">
                                + Klik untuk tambah catatan
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeProduct(item.productId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                        title="Hapus produk"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || productActionLoading || mediaUploadLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={!canSubmit}
              title={
                selectedFiles.length > 0
                  ? "Upload files terlebih dahulu"
                  : !title.trim()
                  ? "Title wajib diisi"
                  : ""
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </span>
              ) : isUpdate ? (
                "Simpan Perubahan"
              ) : (
                "Simpan OOTD"
              )}
            </button>
          </div>
        </form>
        <ConfirmDialog
          open={!!deleteConfirm}
          title="Hapus Media"
          message="Media ini akan dihapus dari OOTD."
          confirmText="Hapus"
          cancelText="Batal"
          onConfirm={() => {
            handleDeleteMediaPermanent(mediaId);
            onClose(); // panggil fungsi close modal
          }}
          onCancel={() => setDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default OotdFormModal;
