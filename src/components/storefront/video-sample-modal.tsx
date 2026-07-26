"use client";

import React from "react";
import { X, Play, ExternalLink } from "lucide-react";

export interface VideoSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  packageTitle?: string;
}

/**
 * Helper function to parse different video URL formats into embeddable URLs or direct video types
 */
function getParsedVideoSource(url: string) {
  if (!url) return { type: "unknown", src: "" };

  const trimmed = url.trim();

  // 1. YouTube Watch or Short URL
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const originParam =
      typeof window !== "undefined"
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : "";
    return {
      type: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1&rel=0${originParam}`,
    };
  }

  // 2. Loom Share URL
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  if (loomMatch && loomMatch[1]) {
    return {
      type: "iframe",
      src: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`,
    };
  }

  // 3. Vimeo URL
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // 4. Google Drive File URL
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: "iframe",
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // 4. Direct Video File (.mp4, .webm, .mov, data:video)
  if (
    /\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith("data:video/") ||
    trimmed.startsWith("blob:")
  ) {
    return {
      type: "video",
      src: trimmed,
    };
  }

  // Default Fallback iframe / URL
  return {
    type: "iframe",
    src: trimmed,
  };
}

export function VideoSampleModal({
  isOpen,
  onClose,
  videoUrl,
  packageTitle = "Sample Video Preview",
}: VideoSampleModalProps) {
  if (!isOpen || !videoUrl) return null;

  const parsed = getParsedVideoSource(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-3 sm:p-6 transition-all animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-surface-900 border border-surface-800 p-4 sm:p-6 shadow-2xl space-y-4 text-white overflow-hidden max-h-[92vh] flex flex-col justify-between">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Play className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {packageTitle}
              </h3>
              <p className="text-[11px] text-surface-400">
                In-App Sample Video Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-surface-400 hover:text-white p-2.5 rounded-xl border border-surface-800 hover:bg-surface-800 transition-colors min-h-10 min-w-10 flex items-center justify-center"
              title="Open Original Link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-surface-400 hover:text-white p-2.5 rounded-xl border border-surface-800 hover:bg-surface-800 transition-colors min-h-10 min-w-10 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner border border-surface-800 min-h-56 sm:min-h-80">
          {parsed.type === "video" ? (
            <video
              src={parsed.src}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={parsed.src}
              title={packageTitle}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-surface-800 shrink-0">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Original Link / Watch on YouTube</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-surface-800 hover:bg-surface-700 text-white px-5 py-2 text-xs font-bold transition-colors min-h-10 shrink-0"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
