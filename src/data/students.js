export const students = [
  {
    id: "9876543210",
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@example.com",
    monthlyFee: 2000,
    collected: 1600,
    status: "active",
    admissionDate: "2024-03-01",
    dueDate: "2025-03-31",
    payments: [
      { amount: 600, date: "2025-03-10", note: "" },
      { amount: 1000, date: "2025-03-01", note: "First instalment" },
    ],
  },
  {
    id: "9123456780",
    name: "Rahul Verma",
    phone: "9123456780",
    email: "rahul@example.com",
    monthlyFee: 1500,
    collected: 1000,
    status: "active",
    admissionDate: "2024-05-12",
    dueDate: "2025-03-31",
    payments: [{ amount: 1000, date: "2025-03-05", note: "" }],
  },
  {
    id: "9234567891",
    name: "Ananya Singh",
    phone: "9234567891",
    email: "ananya@example.com",
    monthlyFee: 2500,
    collected: 0,
    status: "pending",
    admissionDate: "2024-06-20",
    dueDate: "2025-03-31",
    payments: [],
  },
  {
    id: "9345678902",
    name: "Karan Mehta",
    phone: "9345678902",
    email: "karan@example.com",
    monthlyFee: 2000,
    collected: 2000,
    status: "active",
    admissionDate: "2024-02-14",
    dueDate: "2025-03-31",
    payments: [{ amount: 2000, date: "2025-03-02", note: "" }],
  },
  {
    id: "9456789013",
    name: "Sneha Patel",
    phone: "9456789013",
    email: "sneha@example.com",
    monthlyFee: 1800,
    collected: 800,
    status: "pending",
    admissionDate: "2024-07-01",
    dueDate: "2025-03-31",
    payments: [{ amount: 800, date: "2025-03-08", note: "" }],
  },
  {
    id: "9567890124",
    name: "Dev Agarwal",
    phone: "9567890124",
    email: "dev@example.com",
    monthlyFee: 2200,
    collected: 2200,
    status: "active",
    admissionDate: "2024-01-10",
    dueDate: "2026-07-31",
    payments: [{ amount: 2200, date: "2025-03-01", note: "" }],
  },
  {
    id: "9678901235",
    name: "Pooja Nair",
    phone: "9678901235",
    email: "pooja@example.com",
    monthlyFee: 1700,
    collected: 0,
    status: "inactive",
    admissionDate: "2023-11-22",
    dueDate: "2025-03-31",
    payments: [],
  },
];

export function getStudentById(id) {
  return students.find((s) => s.id === id);
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatRupees(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDisplayDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}