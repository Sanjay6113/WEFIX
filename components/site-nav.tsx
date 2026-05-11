"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

const navItems = [
  { href: "/#build", label: "PC Builds" },
  { href: "/#repair", label: "Repair Hub" },
  { href: "/gallery", label: "Gallery" },
  { href: "/check-status", label: "Repair Tracker" },
  { href: "/#pricing", label: "Pricing" }
];

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="WeFix home">
          <span className="brand-logo brand-logo-full">
            <Image src="/images/wefix-final-logo.png" alt="WeFix Computers" width={752} height={454} priority />
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
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
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.label} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
