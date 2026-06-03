"use client";

import Image from "next/image";
import { useState } from "react";

type ListingImageProps = {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  fallbackLabel?: string;
};

export function ListingImage({
  src,
  alt,
  className = "object-cover",
  sizes,
  fallbackLabel = "Foto no disponible",
}: ListingImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const hasError = Boolean(src && failedSrc === src);

  if (!src || hasError) {
    return <ListingImagePlaceholder label={fallbackLabel} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}

function ListingImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.36em] text-[#7B3FE4]">
        NUVANUN
      </span>
      <span className="mt-3 text-sm text-zinc-500">{label}</span>
    </div>
  );
}
