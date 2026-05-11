"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type GalleryMedia = {
  name: string;
  src: string;
  type: "image" | "video";
};

export function GalleryLightbox({
  items,
  driveEmbedUrl
}: {
  items: GalleryMedia[];
  driveEmbedUrl: string | null;
}) {
  const [selected, setSelected] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
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
                  <Image src={item.src} alt={item.name} width={1200} height={900} sizes="(max-width: 900px) 100vw, 33vw" />
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
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={selected.name}>
          <button className="media-lightbox-backdrop" aria-label="Close gallery preview" onClick={() => setSelected(null)} type="button" />
          <div className="media-lightbox-stage">
            <button className="media-lightbox-close" aria-label="Close gallery preview" onClick={() => setSelected(null)} type="button">
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
              <video className="media-lightbox-video" src={selected.src} controls autoPlay />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
