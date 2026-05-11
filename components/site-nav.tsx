import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export function SiteNav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="WeFix home">
          <span className="brand-logo">
            <Image src="/images/wefix-logo-cropped.png" alt="" width={42} height={42} priority />
          </span>
          <span>WeFix</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="/#build">PC Builds</a>
          <a href="/#repair">Repair Hub</a>
          <a href="/#gallery">Gallery</a>
          <Link href="/check-status">Repair Tracker</Link>
          <a href="/#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <Link className="button button-secondary" href="/check-status">
            <CalendarCheck size={18} />
            Track
          </Link>
          <a
            className="button button-primary"
            href={whatsappLink("Hi WeFix, I want a priority tech advisor consultation.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Consult
          </a>
        </div>
      </div>
    </header>
  );
}
