export function formatINR(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
