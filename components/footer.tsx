import Link from "next/link";
import { WhatsAppLink } from "./site-content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>WeFix Tech Advisors & Repair Specialists</span>
        <Link href="/admin" className="admin-footer-link">
          Admin
        </Link>
        <WhatsAppLink
          className="button button-ghost"
          template="footer"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp WeFix
        </WhatsAppLink>
      </div>
    </footer>
  );
}
