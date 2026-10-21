export const label = (value = "") => value.replaceAll("_", " ");
export function ugandaDate(value, time = false) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kampala",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(value));
}
export function safeNext(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\x00-\x1f\x7f]/.test(value)
    ? value
    : "/dashboard";
}
export function friendlyError(error) {
  if (error instanceof Error && error.message === "Session expired")
    return "Your session expired. Please sign in again.";
  if (error instanceof Error && error.safeMessage === true)
    return error.message;
  return "Unable to complete this request. Please try again.";
}
export function canAccess(role, href) {
  if (href === "/admins") return role === "super_admin";
  return role === "editor"
    ? ["/dashboard", "/properties"].includes(href)
    : role === "admin" || role === "super_admin";
}
