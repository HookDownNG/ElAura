"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Maximize2 } from "lucide-react";

export interface InlineVideoPreviewProps {
  videoUrl: string;
  title: string;
  onExpand: () => void;
}

/**
 * Helper to check video type
 */
function parseUrlType(url: string) {
  const trimmed = url.trim();

  // 1. Direct Video File (.mp4, .webm, .mov, data:video)
  if (
    /\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith("data:video/") ||
    trimmed.startsWith("blob:")
  ) {
    return { type: "direct", src: trimmed, poster: null };
  }

  // 2. YouTube URL
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/,
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "image",
      src: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      poster: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }

  // 3. Loom Share URL
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  if (loomMatch && loomMatch[1]) {
    return {
      type: "iframe",
      src: `https://www.loom.com/embed/${loomMatch[1]}?hide_owner=true&hide_share=true&hide_title=true`,
      poster: null,
    };
  }

  // 4. Google Drive File URL
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: "iframe",
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      poster: null,
    };
  }

  return { type: "iframe", src: trimmed, poster: null };
}

export function InlineVideoPreview({
  videoUrl,
  title,
  onExpand,
}: InlineVideoPreviewProps) {
  const parsed = parseUrlType(videoUrl);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full aspect-9/12 sm:aspect-9/14 rounded-2xl overflow-hidden bg-surface-950 border border-surface-200/80 shadow-md group cursor-pointer transition-all hover:scale-[1.01]"
    >
      {/* Video / Image Thumbnail Content */}
      {parsed.type === "direct" ? (
        <video
          src={parsed.src}
          muted
          loop
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
      ) : parsed.type === "image" ? (
        <Image
          src={parsed.src}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <iframe
          src={parsed.src}
          title={title}
          className="w-full h-full border-0 pointer-events-none scale-105"
          allow="autoplay"
        />
      )}

      {/* Dark Gradient Overlay for TikTok / Reel aesthetic */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/30 pointer-events-none transition-opacity duration-300" />

      {/* Top Badge: TikTok/Reels Style */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Center Big Play Button Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? "scale-110 opacity-100" : "scale-100 opacity-90"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 backdrop-blur-xs ring-4 ring-white/30">
          <Play className="h-6 w-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Title & Action Bar */}
      <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
        <p className="text-xs font-extrabold truncate drop-shadow-sm leading-tight">
          {title}
        </p>
        <p className="text-[10px] font-medium text-surface-200 mt-0.5 flex items-center gap-1">
          <span>Click to watch with sound</span>
        </p>
      </div>
    </div>
  );
}
