
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/", icon: "🏠" },
  { name: "Students", href: "/students", icon: "🎓" },
  { name: "Teachers", href: "/teachers", icon: "👩‍🏫" },
  { name: "Classes", href: "/classes", icon: "🏫" },
  { name: "Subjects", href: "/subjects", icon: "📚" },
  { name: "Attendance", href: "/attendance", icon: "📋" },
  { name: "Examinations", href: "/examinations", icon: "📝" },
  { name: "Results", href: "/results", icon: "📊" },
  { name: "Fees", href: "/fees", icon: "💰" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">
        EduManage
      </h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg p-3 transition ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
