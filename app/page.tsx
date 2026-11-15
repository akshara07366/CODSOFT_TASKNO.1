
import Sidebar from "./components/Sidebar";

const stats = [
  { title: "Total Students", value: "1,250", icon: "🎓" },
  { title: "Total Teachers", value: "85", icon: "👩‍🏫" },
  { title: "Attendance", value: "92%", icon: "📋" },
  { title: "Fee Collection", value: "₹8.5L", icon: "💰" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-500">
            Welcome to EduManage School Management System.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="mb-4 text-3xl">{stat.icon}</div>
              <p className="text-sm text-slate-500">{stat.title}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            Quick Overview
          </h2>
          <p className="mt-3 text-slate-500">
            Manage students, teachers, attendance, examinations
            and fee records from one place.
          </p>
        </section>
      </main>
    </div>
  );
}
