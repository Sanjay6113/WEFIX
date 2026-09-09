"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type GalleryMedia = {
  name: string;
  src: string;
  type: "image" | "video";
};

export function GalleryLightbox({
  items,
  driveEmbedUrl,
}: {
  items: GalleryMedia[];
  driveEmbedUrl: string | null;
}) {
  const [selected, setSelected] = useState<GalleryMedia | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.current
      ?.querySelector<HTMLButtonElement>(".media-lightbox-close")
      ?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
      if (event.key === "Tab") {
        const controls = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            'button, a[href], video[controls], [tabindex="0"]',
          ) || [],
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [selected]);

  return (
    <>
      <div className="folder-gallery-grid">
        {items.map((item) => (
          <article className="folder-media-card" key={item.src}>
            <button
              aria-label={`Open ${item.name}`}
              className="folder-media-button"
              onClick={() => setSelected(item)}
              type="button"
            >
              <div className="folder-media-frame">
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={1200}
                    height={900}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                ) : (
                  <video src={item.src} muted preload="metadata" />
                )}
              </div>
            </button>
          </article>
        ))}

        {driveEmbedUrl ? (
          <article className="folder-media-card drive-media-card">
            <iframe
              src={driveEmbedUrl}
              title="WeFix Google Drive gallery"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </article>
        ) : null}
      </div>

      {selected ? (
        <div
          ref={dialog}
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
        >
          <button
            className="media-lightbox-backdrop"
            aria-label="Close gallery preview"
            onClick={() => setSelected(null)}
            type="button"
          />
          <div className="media-lightbox-stage">
            <button
              className="media-lightbox-close"
              aria-label="Close gallery preview"
              onClick={() => setSelected(null)}
              type="button"
            >
              <X size={22} />
            </button>
            {selected.type === "image" ? (
              <Image
                src={selected.src}
                alt={selected.name}
                width={1800}
                height={1200}
                sizes="100vw"
                className="media-lightbox-image"
                priority
              />
            ) : (
              <video
                className="media-lightbox-video"
                src={selected.src}
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
