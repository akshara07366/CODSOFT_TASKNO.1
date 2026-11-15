
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Subject = {
  id: string;
  name: string;
  code: string;
  academicClass: {
    name: string;
    section: string;
  };
};

type Exam = {
  id: string;
  title: string;
  examDate: string;
  totalMarks: number;
  subjectId: string;
  subject: Subject;
};

export default function ExaminationsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [examRes, subjectRes] = await Promise.all([
        fetch("/api/examinations"),
        fetch("/api/subjects"),
      ]);

      const examData = await examRes.json();
      const subjectData = await subjectRes.json();

      if (!examRes.ok || !Array.isArray(examData)) {
        throw new Error(examData.error || "Unable to load examinations.");
      }

      if (!subjectRes.ok || !Array.isArray(subjectData)) {
        throw new Error(subjectData.error || "Unable to load subjects.");
      }

      setExams(examData);
      setSubjects(subjectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
      title: formData.get("title"),
      examDate: formData.get("examDate"),
      totalMarks: Number(formData.get("totalMarks")),
      subjectId: formData.get("subjectId"),
    };

    try {
      const url = editingExam
        ? `/api/examinations/${editingExam.id}`
        : "/api/examinations";

      const response = await fetch(url, {
        method: editingExam ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save examination.");
      }

      setMessage(
        editingExam
          ? "Examination updated successfully!"
          : "Examination added successfully!"
      );

      setShowForm(false);
      setEditingExam(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleEdit(exam: Exam) {
    setEditingExam(exam);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this examination and its results?")) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/examinations/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete examination.");
      }

      setMessage("Examination deleted successfully!");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Examination Management
            </h1>
            <p className="text-slate-500 mt-2">
              Create and manage student examinations.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingExam(null);
              setShowForm(!showForm);
              setMessage("");
              setError("");
            }}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Examination"}
          </button>
        </div>

        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-5">
              {editingExam ? "Edit Examination" : "Add New Examination"}
            </h2>

            {subjects.length === 0 ? (
              <p className="bg-amber-50 text-amber-700 p-3 rounded-lg">
                Please add a subject first in Subjects Management.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-slate-700">
                      Examination Title
                    </label>
                    <input
                      name="title"
                      defaultValue={editingExam?.title || ""}
                      placeholder="e.g. Mid Term Examination"
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-slate-700">
                      Select Subject
                    </label>
                    <select
                      name="subjectId"
                      defaultValue={editingExam?.subjectId || ""}
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    >
                      <option value="">Choose Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code}) -{" "}
                          {subject.academicClass.name}{" "}
                          {subject.academicClass.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-slate-700">
                      Examination Date
                    </label>
                    <input
                      type="date"
                      name="examDate"
                      defaultValue={
                        editingExam
                          ? new Date(editingExam.examDate)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      required
                      className="w-full border rounded-lg p-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-slate-700">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      defaultValue={editingExam?.totalMarks || ""}
                      min="1"
                      step="any"
                      required
                      placeholder="e.g. 100"
                      className="w-full border rounded-lg p-3 text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  {editingExam ? "Update Examination" : "Save Examination"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-800">
              Examination Records
            </h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Loading examinations...</p>
          ) : exams.length === 0 ? (
            <p className="p-6 text-slate-500">
              No examinations added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Examination</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total Marks</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id} className="border-t">
                      <td className="p-4 font-medium text-slate-800">
                        {exam.title}
                      </td>
                      <td className="p-4 text-slate-600">
                        {exam.subject?.name}
                      </td>
                      <td className="p-4 text-slate-600">
                        {exam.subject?.academicClass?.name} -{" "}
                        {exam.subject?.academicClass?.section}
                      </td>
                      <td className="p-4 text-slate-600">
                        {new Date(exam.examDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-600">
                        {exam.totalMarks}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(exam)}
                            className="bg-amber-500 text-white px-3 py-2 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg"
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
