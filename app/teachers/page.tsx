
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Teacher = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<Teacher | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  async function fetchTeachers() {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();

      if (!response.ok) throw new Error("Unable to fetch teachers.");

      setTeachers(data);
    } catch (error) {
      setMessage("Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function openAddForm() {
    setSelectedTeacher(null);
    setFormData({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(teacher: Teacher) {
    setSelectedTeacher(teacher);
    setFormData({
      employeeId: teacher.employeeId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || "",
    });
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    try {
      const url = selectedTeacher
        ? `/api/teachers/${selectedTeacher.id}`
        : "/api/teachers";

      const response = await fetch(url, {
        method: selectedTeacher ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save teacher.");
      }

      setMessage(
        selectedTeacher
          ? "Teacher updated successfully!"
          : "Teacher added successfully!"
      );

      setShowForm(false);
      setSelectedTeacher(null);
      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });

      await fetchTeachers();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete teacher.");
      }

      setMessage("Teacher deleted successfully!");
      await fetchTeachers();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete teacher."
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
              Teachers
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your school teachers and their details.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Add Teacher
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
              {selectedTeacher ? "Edit Teacher" : "Add New Teacher"}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="employeeId"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-lg border p-3 text-slate-800"
              />

              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="rounded-lg border p-3 text-slate-800"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                {selectedTeacher ? "Update Teacher" : "Save Teacher"}
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
              Teacher Records
            </h2>
            <span className="text-sm text-slate-500">
              Total: {teachers.length}
            </span>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <p className="text-slate-500">No teachers added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b">
                      <td className="p-3 text-slate-700">
                        {teacher.employeeId}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {teacher.firstName} {teacher.lastName}
                      </td>
                      <td className="p-3 text-slate-700">
                        {teacher.email}
                      </td>
                      <td className="p-3 text-slate-700">
                        {teacher.phone || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditForm(teacher)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(teacher.id)}
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
