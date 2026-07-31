const INK = "#1C2541";
const BRASS = "#A9791F";

// TODO: replace with real data from your API
const stats = {
  ownerName: "Library Owner",
  libraryName: "Library Junction",
  activeStudents: 138,
  totalStudents: 142,
  collected: "₹2.8L",
  pending: "₹32.0K",
};

// TODO: replace with real fee-due data from your API
const feeAlerts = [
  { name: "Priya Sharma", phone: "9876543210", overdueDays: 143, dueDate: "10 Mar 2026" },
  { name: "Rahul Verma", phone: "9123456780", overdueDays: 140, dueDate: "13 Mar 2026" },
  { name: "Ananya Singh", phone: "9234567891", overdueDays: 137, dueDate: "16 Mar 2026" },
  { name: "Karan Mehta", phone: "9345678902", overdueDays: 136, dueDate: "17 Mar 2026" },
  { name: "Sneha Patel", phone: "9456789013", overdueDays: 135, dueDate: "18 Mar 2026" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: INK }}>
        {value}
      </p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Welcome back 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {stats.ownerName} · {stats.libraryName}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={stats.activeStudents} sublabel="Total Students" />
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Collected" value={stats.collected} />
        <StatCard label="Pending" value={stats.pending} />
      </div>

      {/* Fee Due Alerts */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold" style={{ color: INK }}>
          Fee Due Alerts
        </h2>
        <p className="mb-4 text-xs text-gray-400">Overdue & due within 4 days</p>

        <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
          {feeAlerts.map((student) => (
            <div
              key={student.phone}
              className="flex items-center gap-3 py-3"
              style={{ borderColor: "#F0EDE5" }}
            >
              {/* Initials avatar */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: BRASS }}
              >
                {getInitials(student.name)}
              </div>

              {/* Name + phone */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: INK }}>
                  {student.name}
                </p>
                <p className="text-xs text-gray-400">{student.phone}</p>
              </div>

              {/* Overdue info */}
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-red-600">
                  {student.overdueDays}d overdue
                </p>
                <p className="text-xs text-gray-400">{student.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}