export function whatsappUrl(phone = "") {
  let value = phone.replace(/[\s()-]/g, "");
  if (/^0[37]\d{8}$/.test(value)) value = `+256${value.slice(1)}`;
  return /^\+[1-9]\d{7,14}$/.test(value)
    ? `https://wa.me/${value.slice(1)}`
    : null;
}
export function unusualTransition(before, after) {
  return (
    before !== after &&
    (["completed", "cancelled", "rejected", "no_show"].includes(before) ||
      (before === "confirmed" && after === "pending"))
  );
}
