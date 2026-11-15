
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type AcademicClass = {
  id: string;
  name: string;
  section: string;
  academicYear: string;
};

type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  classId: string | null;
  academicClass: AcademicClass | null;
};

export default function StudentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students
  async function fetchStudents() {
    try {
      const response = await fetch("/api/students");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to fetch students");
      }

      setStudents(result);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  // Fetch classes
  async function fetchClasses() {
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to fetch classes");
      }

      setClasses(result);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load classes"
      );
    }
  }

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Open Add Student form
  function openAddForm() {
    setSelectedStudent(null);
    setMessage("");
    setShowForm(true);
  }

  // Open Edit Student form
  function openEditForm(student: Student) {
    setSelectedStudent(student);
    setMessage("");
    setShowForm(true);
  }

  // Save or update student
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const studentData = {
      admissionNo: formData.get("admissionNo"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      classId: formData.get("classId"),
    };

    setMessage(selectedStudent ? "Updating student..." : "Saving student...");

    try {
      const response = await fetch(
        selectedStudent
          ? `/api/students/${selectedStudent.id}`
          : "/api/students",
        {
          method: selectedStudent ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save student");
      }

      setShowForm(false);
      setSelectedStudent(null);

      setMessage(
        selectedStudent
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      await fetchStudents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  // Delete student
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete student");
      }

      setMessage("Student deleted successfully!");
      await fetchStudents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete student"
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Page Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Students
            </h1>

            <p className="mt-2 text-slate-500">
              Manage student records and information.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            + Add Student
          </button>
        </div>

        {/* Messages */}
        {message && (
          <p className="mb-5 rounded-lg bg-white p-4 text-slate-700">
            {message}
          </p>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              {selectedStudent ? "Edit Student" : "Register New Student"}
            </h2>

            <form
              key={selectedStudent?.id ?? "new"}
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              <input
                name="admissionNo"
                placeholder="Admission Number"
                defaultValue={selectedStudent?.admissionNo || ""}
                required
                className="rounded-lg border p-3"
              />

              <input
                name="firstName"
                placeholder="First Name"
                defaultValue={selectedStudent?.firstName || ""}
                required
                className="rounded-lg border p-3"
              />

              <input
                name="lastName"
                placeholder="Last Name"
                defaultValue={selectedStudent?.lastName || ""}
                required
                className="rounded-lg border p-3"
              />

              <input
                name="dob"
                type="date"
                defaultValue={
                  selectedStudent?.dob
                    ? new Date(selectedStudent.dob).toISOString().split("T")[0]
                    : ""
                }
                className="rounded-lg border p-3"
              />

              <select
                name="gender"
                defaultValue={selectedStudent?.gender || ""}
                className="rounded-lg border p-3"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                name="phone"
                placeholder="Phone Number"
                defaultValue={selectedStudent?.phone || ""}
                className="rounded-lg border p-3"
              />

              {/* Class Dropdown */}
              <select
                name="classId"
                defaultValue={selectedStudent?.classId || ""}
                className="rounded-lg border p-3"
              >
                <option value="">Select Class</option>

                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name} - Section {schoolClass.section} (
                    {schoolClass.academicYear})
                  </option>
                ))}
              </select>

              <textarea
                name="address"
                placeholder="Address"
                defaultValue={selectedStudent?.address || ""}
                className="rounded-lg border p-3 sm:col-span-2"
              />

              {classes.length === 0 && (
                <p className="text-sm text-amber-700 sm:col-span-2">
                  No classes available. Please create a class first.
                </p>
              )}

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedStudent(null);
                  }}
                  className="rounded-lg bg-slate-200 px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  {selectedStudent ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Records */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Student Records
            </h2>

            <span className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700">
              Total: {students.length}
            </span>
          </div>

          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-slate-500">
              No student records available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Admission No.</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-3">{student.admissionNo}</td>

                      <td className="p-3">
                        {student.firstName} {student.lastName}
                      </td>

                      <td className="p-3">
                        {student.gender || "-"}
                      </td>

                      <td className="p-3">
                        {student.phone || "-"}
                      </td>

                      <td className="p-3">
                        {student.academicClass
                          ? `${student.academicClass.name} - ${student.academicClass.section}`
                          : "Not assigned"}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(student)}
                            className="rounded bg-blue-100 px-3 py-2 text-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(student.id)}
                            className="rounded bg-red-100 px-3 py-2 text-red-700"
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
