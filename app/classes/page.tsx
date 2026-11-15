
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type SchoolClass = {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  _count?: {
    students: number;
  };
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] =
    useState<SchoolClass | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    section: "",
    academicYear: "",
  });

  async function fetchClasses() {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch classes.");
      }

      setClasses(data);
    } catch (error) {
      setMessage("Unable to load classes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function openAddForm() {
    setSelectedClass(null);
    setFormData({
      name: "",
      section: "",
      academicYear: "",
    });
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(schoolClass: SchoolClass) {
    setSelectedClass(schoolClass);
    setFormData({
      name: schoolClass.name,
      section: schoolClass.section,
      academicYear: schoolClass.academicYear,
    });
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    try {
      const url = selectedClass
        ? `/api/classes/${selectedClass.id}`
        : "/api/classes";

      const response = await fetch(url, {
        method: selectedClass ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save class.");
      }

      setMessage(
        selectedClass
          ? "Class updated successfully!"
          : "Class added successfully!"
      );

      setShowForm(false);
      setSelectedClass(null);
      setFormData({
        name: "",
        section: "",
        academicYear: "",
      });

      await fetchClasses();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete class.");
      }

      setMessage("Class deleted successfully!");
      await fetchClasses();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete class."
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Classes
            </h1>
            <p className="mt-2 text-slate-500">
              Manage school classes, sections and academic years.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Add Class
          </button>
        </div>

        {message && (
          <p className="mb-5 rounded-lg bg-white p-3 text-slate-700">
            {message}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-semibold text-slate-800">
              {selectedClass ? "Edit Class" : "Add New Class"}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="name"
                placeholder="Class Name (e.g. Class 10)"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="section"
                placeholder="Section (e.g. A)"
                value={formData.section}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="academicYear"
                placeholder="Academic Year (e.g. 2026-2027)"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                {selectedClass ? "Update Class" : "Save Class"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Class Records
            </h2>

            <span className="text-sm text-slate-500">
              Total: {classes.length}
            </span>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-500">No classes added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="p-3">Class</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Academic Year</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {classes.map((schoolClass) => (
                    <tr key={schoolClass.id} className="border-b">
                      <td className="p-3 font-medium text-slate-800">
                        {schoolClass.name}
                      </td>

                      <td className="p-3 text-slate-700">
                        {schoolClass.section}
                      </td>

                      <td className="p-3 text-slate-700">
                        {schoolClass.academicYear}
                      </td>

                      <td className="p-3 text-slate-700">
                        {schoolClass._count?.students ?? 0}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditForm(schoolClass)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(schoolClass.id)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
