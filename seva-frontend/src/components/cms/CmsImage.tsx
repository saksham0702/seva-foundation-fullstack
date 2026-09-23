"use client";

import React, { useState } from "react";

interface CmsImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export function CmsImage({
  src,
  alt,
  fallbackSrc,
  className,
  ...props
}: CmsImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (hasError && !fallbackSrc) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setHasError(true);
        }
      }}
      {...props}
    />
  );
}
