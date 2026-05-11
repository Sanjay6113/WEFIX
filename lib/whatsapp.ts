const defaultPhone = "919994428061";

export function whatsappLink(message: string) {
  const phone = process.env.NEXT_PUBLIC_WEFIX_WHATSAPP || defaultPhone;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
