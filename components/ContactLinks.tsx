import { whatsappUrl } from "../lib/operations.mjs";
export function ContactLinks({
  email,
  phone,
}: {
  email?: string;
  phone?: string;
}) {
  const whatsapp = whatsappUrl(phone);
  return (
    <div className="contact-links">
      {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
        <a href={`mailto:${email}`}>{email}</a>
      )}
      {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>}
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noreferrer">
          WhatsApp ↗
        </a>
      )}
    </div>
  );
}
