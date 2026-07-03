import { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  width?: number;
  height?: number;
}

const LazyImage = ({ src, alt, className = '', placeholderSrc, width, height }: LazyImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(placeholderSrc || '');

  const entry = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setImgSrc(src);
    }
  }, [entry, src]);

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default LazyImage;
