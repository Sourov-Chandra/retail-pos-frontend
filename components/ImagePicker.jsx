"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Camera, Link as LinkIcon, X, Check, RefreshCw, AlertCircle } from "lucide-react";

export default function ImagePicker({ value, onChange }) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "camera" | "url"
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when unmounted or switched tab
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or device not found. Please verify permissions.");
    }
  };

  // Upload an image blob/file to the backend
  const uploadFile = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || `Upload failed with status ${response.status}`);
      }

      onChange(data.url);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        alert(
          "Cannot connect to the backend server.\n\nPlease make sure your backend is running on http://localhost:5000 (cd server && npm run dev)."
        );
      } else {
        alert(err.message || "Failed to upload image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Capture photo from live camera canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
          stopCamera();
          uploadFile(file);
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Product Image
      </label>

      {/* Current Image Preview */}
      {value ? (
        <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 shadow-sm">
          <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
            <img
              src={value}
              alt="Product preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Image Selected</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-3">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/80 dark:bg-slate-950 p-1 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab("file");
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activeTab === "file"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("camera");
                startCamera();
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activeTab === "camera"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab("url");
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activeTab === "url"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === "file" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.avif,.webp,.png,.jpg,.jpeg,.gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/60 py-6 text-xs text-slate-600 dark:text-slate-400 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
              >
                {isUploading ? (
                  <RefreshCw className="h-6 w-6 animate-spin text-brand-500" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-brand-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Choose an image from your computer</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">AVIF, WebP, PNG, JPG, GIF up to 15MB</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Live Camera Snapshot */}
          {activeTab === "camera" && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-slate-300 dark:border-slate-800 bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <span className="text-xs text-slate-400">Starting camera...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isCameraActive && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  <span>Snap & Use Photo</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: Direct Web URL */}
          {activeTab === "url" && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 px-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none shadow-sm"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
