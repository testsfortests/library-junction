export const INK = "#1C2541";
export const BRASS = "#A9791F";

export const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  review: { bg: "#EAF1FE", text: "#2563EB" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

export const feeTypeOptions = [
  { value: "monthly", label: "Monthly", suffix: "/mo", months: 1 },
  { value: "quarterly", label: "Quarterly", suffix: "/qtr", months: 3 },
  { value: "half_yearly", label: "Half Yearly", suffix: "/half-yr", months: 6 },
  { value: "yearly", label: "Yearly", suffix: "/yr", months: 12 },
];

export const feePresets = [
  { label: "Free", value: 0 },
  { label: "₹500", value: 500 },
  { label: "₹1000", value: 1000 },
  { label: "₹1500", value: 1500 },
  { label: "₹2000", value: 2000 },
];

export const paidPresets = [
  { label: "Zero", value: 0 },
  { label: "₹500", value: 500 },
  { label: "₹1000", value: 1000 },
  { label: "₹1500", value: 1500 },
  { label: "₹2000", value: 2000 },
];

export const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
];

export const shiftOptions = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "full_day", label: "Full Day" },
];

export const shiftLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  full_day: "Full Day",
};

export const paymentMethodLabels = {
  cash: "Cash",
  online: "Online",
};

export function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatRupees(amount) {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function feeSuffix(feeType) {
  return feeTypeOptions.find((f) => f.value === feeType)?.suffix || "/mo";
}

// Adds `months` to a YYYY-MM-DD date string, clamping the day to the
// target month's last day (e.g. Jan 31 + 1mo -> Feb 28/29).
export function addMonthsToDateStr(dateStr, months) {
  const d = new Date(dateStr);
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInResultMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, daysInResultMonth));
  return d.toISOString().split("T")[0];
}

// Same rule used across Add Member / Confirm Member: paying >= fee -> active,
// paying < fee -> pending, fee of 0 (free) -> always active.
export function computeStatus(feeValue, paidValue) {
  if (feeValue === 0) return "active";
  if (paidValue >= feeValue) return "active";
  return "pending";
}