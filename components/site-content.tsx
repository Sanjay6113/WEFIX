"use client";
import { createContext, useContext } from "react";
import type { SiteContent, TemplateKey } from "@/lib/domain";
import { money, messageLink, renderTemplate } from "@/lib/domain";
import { defaultContent } from "@/lib/defaults";
const Content = createContext<SiteContent>(defaultContent);
export const useSiteContent = () => useContext(Content);
export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return <Content.Provider value={content}>{children}</Content.Provider>;
}
export function WhatsAppLink({
  template,
  variables = {},
  children,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  template: TemplateKey;
  variables?: Record<string, string>;
}) {
  const content = useSiteContent();
  const body = renderTemplate(content.templates[template], {
    consultation_fee: money(content.consultationFee),
    ...variables,
  });
  return (
    <a
      {...props}
      href={messageLink(content.phone, body)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
