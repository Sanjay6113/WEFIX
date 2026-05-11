import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, MessageCircle } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const galleryDir = path.join(process.cwd(), "public", "gallery");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

type LocalMedia = {
  name: string;
  src: string;
  type: "image" | "video";
};

function getLocalMedia(): LocalMedia[] {
  try {
    if (!fs.existsSync(galleryDir)) {
      return [];
    }

    return fs
      .readdirSync(galleryDir, { withFileTypes: true })
      .filter((item) => item.isFile())
      .map((item) => {
        const extension = path.extname(item.name).toLowerCase();
        const type = imageExtensions.has(extension) ? "image" : videoExtensions.has(extension) ? "video" : null;

        if (!type) {
          return null;
        }

        return {
          name: path.basename(item.name, extension).replace(/[-_]+/g, " "),
          src: `/gallery/${encodeURIComponent(item.name)}`,
          type
        };
      })
      .filter((item): item is LocalMedia => Boolean(item))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function getDriveEmbedUrl() {
  const driveLink = (
    process.env.NEXT_PUBLIC_GALLERY_DRIVE_LINK || process.env.NEXT_PUBLIC_GALARY_DRIVE_LINK
  )?.trim();

  if (!driveLink) {
    return null;
  }

  const folderMatch = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/) ?? driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const folderId = folderMatch?.[1];

  if (folderId) {
    return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  }

  return driveLink;
}

function EmptyGallery() {
  return (
    <div className="gallery-empty">
      <ImageIcon size={52} strokeWidth={1.5} />
      <h2>No photos yet.</h2>
      <p>Add photos or videos inside <span>public/gallery</span>, or configure a public Google Drive gallery link.</p>
    </div>
  );
}

export default function GalleryPage() {
  const localMedia = getLocalMedia();
  const driveEmbedUrl = getDriveEmbedUrl();
  const hasMedia = localMedia.length > 0 || Boolean(driveEmbedUrl);

  return (
    <main className="site-shell nuke-gallery-page">
      <SiteNav />
      <section className="nuke-gallery-hero">
        <div className="container">
          <Link className="button button-ghost" href="/">
            <ArrowLeft size={18} />
            Back home
          </Link>
          <div className="nuke-gallery-head">
            <h1>
              WeFix <span>Gallery</span>
            </h1>
            <div className="gallery-tabs" aria-label="Gallery sources">
              <a className="gallery-tab active" href="#local-gallery">Gallery</a>
              <a className="gallery-tab" href="#drive-gallery">Drive Link</a>
            </div>
          </div>
        </div>
      </section>

      <section className="nuke-gallery-content" id="local-gallery">
        <div className="container">
          {hasMedia ? (
            <>
              {localMedia.length > 0 ? (
                <div className="folder-gallery-grid">
                  {localMedia.map((item) => (
                    <article className="folder-media-card" key={item.src}>
                      <div className="folder-media-frame">
                        {item.type === "image" ? (
                          <Image src={item.src} alt={item.name} fill sizes="(max-width: 900px) 100vw, 33vw" />
                        ) : (
                          <video src={item.src} controls preload="metadata" />
                        )}
                      </div>
                      <div className="folder-media-caption">
                        <span>{item.type}</span>
                        <h2>{item.name}</h2>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              <section className="drive-gallery-panel" id="drive-gallery">
                <div>
                  <p className="section-kicker">Drive Link</p>
                  <h2>Google Drive media</h2>
                  <p>
                    Add a public Drive folder link in <span>NEXT_PUBLIC_GALLERY_DRIVE_LINK</span> to show Drive photos
                    and videos here.
                  </p>
                </div>
                {driveEmbedUrl ? (
                  <iframe
                    src={driveEmbedUrl}
                    title="WeFix Google Drive gallery"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="drive-empty">No Drive link added yet.</div>
                )}
              </section>
            </>
          ) : (
            <EmptyGallery />
          )}
        </div>
      </section>

      <section className="gallery-share-cta">
        <div className="container">
          <a
            className="button button-primary"
            href={whatsappLink("Hi WeFix, I want to share photos or videos for the website gallery.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Share Gallery Media
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
