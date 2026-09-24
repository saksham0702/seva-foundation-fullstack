"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CmsImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function CmsImage({
  src,
  alt,
  fallbackSrc,
  className,
  fill,
  width = 600,
  height = 400,
  priority,
  sizes,
}: CmsImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (hasError && !fallbackSrc) {
    return null;
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        className={className}
        onError={() => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          } else {
            setHasError(true);
          }
        }}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}
