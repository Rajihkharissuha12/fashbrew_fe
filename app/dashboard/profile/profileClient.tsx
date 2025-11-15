// app/dashboard/profile/ProfileClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Link as LinkIcon,
  Copy,
  Check,
  Calendar,
  Activity,
  ExternalLink,
  Shield,
  Clock,
  Settings,
  Edit2,
} from "lucide-react";

// Types tetap sama...
type Role = "admin" | "user";

type ActivityLog = {
  id: string;
  userId: string;
  actionType: string;
  targetType: string | null;
  targetId: string | null;
  timestamp: string;
  metadata: any;
};

type Influencer = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  socialLinks: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserProfile = {
  id: string;
  authUserId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  influencer: Influencer | null;
  activities: ActivityLog[];
};

// Fetch user profile by userId
async function fetchMyProfile(
  apiBase: string,
  userId: string
): Promise<UserProfile> {
  const res = await fetch(`${apiBase}/api/users/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data;
}

export default function ProfileClient({
  userId,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
}: {
  userId: string;
  apiBaseUrl?: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMyProfile(apiBaseUrl, userId)
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Gagal memuat profile");
      })
      .finally(() => setLoading(false));
  }, [apiBaseUrl, userId]);

  // Public profile URL menggunakan handle
  const publicProfileUrl = users?.influencer?.handle
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${
        users.influencer.handle
      }`
    : null;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !users) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Profile tidak ditemukan"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-900 dark:text-white hover:underline"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Semua JSX UI sama seperti sebelumnya... */}
      {/* Copy paste seluruh JSX return dari kode Anda */}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>

            <button
              //   onClick={() => router.push("/dashboard/profile/edit")}
              disabled
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Banner + Avatar */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
              {/* Banner */}
              {users?.influencer?.banner ? (
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <img
                    src={users.influencer.banner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700"></div>
              )}

              {/* Avatar - overlapping banner */}
              <div className="px-6 pb-6">
                <div className="-mt-12 mb-4 relative inline-block">
                  {users?.influencer?.avatar ? (
                    <img
                      src={users.influencer.avatar}
                      alt={users.influencer.name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-bold ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                      <User className="w-12 h-12" />
                    </div>
                  )}

                  {/* Status indicator */}
                  {users?.influencer?.isActive && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full dark:border-zinc-900"></div>
                  )}
                </div>

                {users?.influencer ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.influencer?.name}
                    </h2>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">
                      @{users.influencer?.handle}
                    </p>
                    {users.influencer?.bio && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed dark:text-gray-400">
                        {users.influencer.bio}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-2">
                    <p className="text-gray-500 mb-2 dark:text-gray-400">
                      Setup your influencer profile
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/profile/setup")}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Create Influencer Profile →
                    </button>
                  </div>
                )}

                {/* Social Links */}
                {users?.influencer?.socialLinks &&
                  Object.keys(users.influencer.socialLinks).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 dark:text-gray-400">
                        Social Links
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          users.influencer.socialLinks as Record<string, string>
                        ).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 capitalize transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300"
                          >
                            {platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Account Info */}
              <div className="px-6 pb-6 border-t border-gray-200 pt-4 space-y-3 dark:border-zinc-800">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Role:{" "}
                    <span className="font-semibold capitalize">
                      {users?.role}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Member since{" "}
                    {new Date(users?.createdAt || "").toLocaleDateString(
                      "id-ID",
                      {
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                {users?.lastLogin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Last login{" "}
                      {new Date(users?.lastLogin || "").toLocaleString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-semibold text-gray-900 mb-4 dark:text-white">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  disabled
                  onClick={() => router.push("/dashboard/profile/edit")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Edit Profile
                  </span>
                </button>

                <button
                  disabled
                  onClick={() => router.push("/dashboard/settings")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Settings
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* PUBLIC PROFILE URL - PROMINENT */}
            {publicProfileUrl && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm dark:bg-zinc-800">
                    <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 dark:text-white">
                      Your Public Profile URL
                    </h2>

                    <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700">
                      <code className="flex-1 text-sm font-mono text-gray-900 truncate dark:text-white">
                        {publicProfileUrl}
                      </code>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyToClipboard(publicProfileUrl)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-zinc-800"
                          title="Copy URL"
                        >
                          {copiedUrl ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>

                        <a
                          href={publicProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors dark:hover:bg-blue-900/30"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-3 dark:text-gray-400">
                      Share this URL untuk menampilkan profile dan OOTD Anda ke
                      publik
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                  <Activity className="w-5 h-5" />
                  Your Recent Activity
                </h2>
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                  Track your latest actions on the platform
                </p>
              </div>

              <div className="p-6">
                {users?.activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No activity yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">
                      Start creating OOTDs or products to see your activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {users?.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      >
                        <div className="p-2 bg-white rounded-lg dark:bg-zinc-900">
                          <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatActionType(activity.actionType)}
                          </p>

                          {activity.targetType && (
                            <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                              {activity.targetType}
                              {activity.targetId && (
                                <code className="ml-2 text-xs bg-white px-2 py-0.5 rounded dark:bg-zinc-950">
                                  {activity.targetId.slice(0, 8)}...
                                </code>
                              )}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
