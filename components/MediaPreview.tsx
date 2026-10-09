"use client";
import Image from "next/image";
import { useState } from "react";
export function MediaPreview({
  src,
  alt = "",
  compact = false,
}: {
  src: string;
  alt?: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span
      className={compact ? "thumbnail-placeholder" : "video-preview"}
      aria-label="Image preview unavailable"
    >
      {compact ? "H." : "Preview unavailable"}
    </span>
  ) : (
    <Image
      unoptimized
      width={compact ? 44 : 100}
      height={compact ? 44 : 100}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
