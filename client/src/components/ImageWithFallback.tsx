import { useEffect, useState, type ImgHTMLAttributes } from "react";

type ImageWithFallbackProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export default function ImageWithFallback({ src, alt, className, fallbackClassName, onError, ...props }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return <div role="img" aria-label={alt ?? "Product image unavailable"} className={fallbackClassName ?? className ?? "product-card-image"} />;
  }

  return <img {...props} src={src ?? undefined} alt={alt} className={className} onError={event => { onError?.(event); setFailed(true); }} />;
}
