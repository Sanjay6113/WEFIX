import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>WeFix Tech Advisors & Repair Specialists</span>
        <a
          className="button button-ghost"
          href={whatsappLink("Hi WeFix, I need help with my device.")}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp WeFix
        </a>
      </div>
    </footer>
  );
}
