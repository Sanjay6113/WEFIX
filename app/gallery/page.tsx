import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";
import { whatsappLink } from "@/lib/whatsapp";

const companyImages = [
  {
    src: "/images/wefix-logo.png",
    title: "WeFix service mark",
    copy: "Primary company logo for digital use."
  },
  {
    src: "/images/wefix-logo.jpg",
    title: "WeFix full brand logo",
    copy: "Original full logo asset with brand name."
  }
];

const pcBuildImages = [
  {
    src: "/images/wefix-hero-pc.png",
    title: "Premium liquid-cooled PC",
    copy: "Hero build visual for high-end gaming and workstation consultations."
  },
  {
    src: "/images/wefix-hero-pc.png",
    title: "Build showcase detail",
    copy: "Cooling, cable management, and clean hardware presentation."
  },
  {
    src: "/images/wefix-hero-pc.png",
    title: "Stress-test ready build",
    copy: "PC build imagery for the testing and handover workflow."
  }
];

function GallerySection({
  title,
  copy,
  items
}: {
  title: string;
  copy: string;
  items: { src: string; title: string; copy: string }[];
}) {
  return (
    <section className="section gallery-page-section">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">Gallery</p>
            <h2 className="section-title">{title}</h2>
          </div>
          <p className="section-copy">{copy}</p>
        </div>
        <div className="media-gallery-grid">
          {items.map((item) => (
            <article className="media-card" key={`${title}-${item.title}`}>
              <div className="media-frame">
                <Image src={item.src} alt={item.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
              </div>
              <div className="media-card-body">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <main className="site-shell gallery-page">
      <SiteNav />
      <section className="gallery-hero">
        <div className="container">
          <Link className="button button-ghost" href="/">
            <ArrowLeft size={18} />
            Back home
          </Link>
          <div className="gallery-hero-content">
            <p className="section-kicker">WeFix Gallery</p>
            <h1>Company images and PC build work.</h1>
            <p className="hero-copy">
              A dedicated gallery for WeFix brand visuals, service images, and premium PC build showcases.
            </p>
            <a
              className="button button-primary"
              href={whatsappLink("Hi WeFix, I want to share images for a build or repair consultation.")}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Share Your Device Photos
            </a>
          </div>
        </div>
      </section>
      <GallerySection
        title="Company Images"
        copy="Brand and identity assets currently available for the website."
        items={companyImages}
      />
      <GallerySection
        title="PC Build Images"
        copy="Build-focused visuals for consultations, premium PC requests, and high-performance handovers."
        items={pcBuildImages}
      />
      <Footer />
    </main>
  );
}
