import { useState } from 'react';

const FALLBACK_IMG = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="none"><rect width="400" height="500" fill="#F7F0E8"/><text x="200" y="240" text-anchor="middle" fill="#8D7770" font-family="serif" font-size="24">GlowCare</text><text x="200" y="270" text-anchor="middle" fill="#8D777099" font-family="sans-serif" font-size="12">Image unavailable</text></svg>`);

export default function ImageWithFallback({ src, alt, className = '', ...props }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMG);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Product image'}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
