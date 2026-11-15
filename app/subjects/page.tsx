
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type AcademicClass = {
  id: string;
  name: string;
  section: string;
  academicYear: string;
};

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId: string | null;
  academicClass: AcademicClass;
  teacher: Teacher | null;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [subjectRes, classRes, teacherRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/classes"),
        fetch("/api/teachers"),
      ]);

      const [subjectData, classData, teacherData] = await Promise.all([
        subjectRes.json(),
        classRes.json(),
        teacherRes.json(),
      ]);

      if (!subjectRes.ok || !Array.isArray(subjectData)) {
        throw new Error(subjectData.error || "Unable to load subjects.");
      }

      if (!classRes.ok || !Array.isArray(classData)) {
        throw new Error(classData.error || "Unable to load classes.");
      }

      if (!teacherRes.ok || !Array.isArray(teacherData)) {
        throw new Error(teacherData.error || "Unable to load teachers.");
      }

      setSubjects(subjectData);
      setClasses(classData);
      setTeachers(teacherData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name"),
      code: formData.get("code"),
      classId: formData.get("classId"),
      teacherId: formData.get("teacherId"),
    };

    try {
      const url = editingSubject
        ? `/api/subjects/${editingSubject.id}`
        : "/api/subjects";

      const response = await fetch(url, {
        method: editingSubject ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save subject.");
      }

      setMessage(
        editingSubject
          ? "Subject updated successfully!"
          : "Subject added successfully!"
      );

      setShowForm(false);
      setEditingSubject(null);

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  function handleEdit(subject: Subject) {
    setEditingSubject(subject);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete subject.");
      }

      setMessage("Subject deleted successfully!");
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Subjects Management
            </h1>
            <p className="text-slate-500 mt-2">
              Manage subjects, classes and assigned teachers.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSubject(null);
              setShowForm(!showForm);
              setMessage("");
              setError("");
            }}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Subject"}
          </button>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-5 text-slate-800">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </h2>

            {classes.length === 0 ? (
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                Please create a class first before adding a subject.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Subject Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingSubject?.name || ""}
                      placeholder="e.g. Mathematics"
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Subject Code
                    </label>
                    <input
                      name="code"
                      type="text"
                      defaultValue={editingSubject?.code || ""}
                      placeholder="e.g. MATH101"
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Select Class
                    </label>
                    <select
                      name="classId"
                      defaultValue={editingSubject?.classId || ""}
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    >
                      <option value="">Choose Class</option>
                      {classes.map((academicClass) => (
                        <option key={academicClass.id} value={academicClass.id}>
                          {academicClass.name} - {academicClass.section} (
                          {academicClass.academicYear})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Assign Teacher
                    </label>
                    <select
                      name="teacherId"
                      defaultValue={editingSubject?.teacherId || ""}
                      className="w-full border rounded-lg p-3 text-slate-800"
                    >
                      <option value="">No Teacher Assigned</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  {editingSubject ? "Update Subject" : "Save Subject"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-800">
              Subject Records
            </h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="p-6 text-slate-500">
              No subjects added yet. Click Add Subject to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-t">
                      <td className="p-4 font-medium text-slate-800">
                        {subject.name}
                      </td>
                      <td className="p-4 text-slate-600">
                        {subject.code}
                      </td>
                      <td className="p-4 text-slate-600">
                        {subject.academicClass?.name} -{" "}
                        {subject.academicClass?.section}
                      </td>
                      <td className="p-4 text-slate-600">
                        {subject.teacher
                          ? `${subject.teacher.firstName} ${subject.teacher.lastName}`
                          : "Not assigned"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
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
