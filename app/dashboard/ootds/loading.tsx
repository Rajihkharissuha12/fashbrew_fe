"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full py-20">
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className="w-24 h-24 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"
          style={{ borderLeftColor: "black", borderRightColor: "white" }}
        />

        {/* Shirt emoji in center */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          👕
        </div>
      </div>
    </div>
  );
}
