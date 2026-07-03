import { useState, useRef, useCallback } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
  badges?: React.ReactNode;
}

/**
 * ImageGallery — large main image with thumbnail strip.
 * Click to open a fullscreen zoom modal with pan support.
 */
export default function ImageGallery({ images, badges }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const goToPrev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goToNext = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const current = images[activeIndex];

  return (
    <>
      {/* ── Main Image ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div
          ref={imageRef}
          onMouseEnter={() => setIsPanning(true)}
          onMouseLeave={() => setIsPanning(false)}
          onMouseMove={handleMouseMove}
          className="group relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface cursor-zoom-in"
          onClick={() => setZoomOpen(true)}
        >
          <img
            src={current.src}
            alt={current.alt}
            className="h-full w-full object-cover transition-transform duration-300"
            style={
              isPanning
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)',
                  }
                : undefined
            }
          />

          {/* Badges overlay */}
          {badges && (
            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
              {badges}
            </div>
          )}

          {/* Zoom hint */}
          <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-bg/80 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            Hover to zoom · Click to expand
          </div>

          {/* Nav arrows (if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/80 text-text backdrop-blur-md opacity-0 transition-opacity duration-200 hover:bg-bg group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/80 text-text backdrop-blur-md opacity-0 transition-opacity duration-200 hover:bg-bg group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* ── Thumbnails ────────────────────────────────────── */}
        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200',
                  i === activeIndex
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-border opacity-60 hover:opacity-100',
                )}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Zoom Modal ──────────────────────────────── */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso-950/90 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg/80 text-text hover:bg-surface-hover transition-colors z-10"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Nav */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-bg/80 text-text hover:bg-surface-hover transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-bg/80 text-text hover:bg-surface-hover transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            />
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bg/80 px-4 py-1.5 text-xs font-medium text-text-muted backdrop-blur-md">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
