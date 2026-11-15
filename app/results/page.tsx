
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Exam = {
  id: string;
  title: string;
  totalMarks: number;
  subject: {
    name: string;
    classId: string;
    academicClass: {
      name: string;
      section: string;
    };
  };
};

type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classId: string | null;
};

type Result = {
  id: string;
  studentId: string;
  marksObtained: number;
  grade: string | null;
};

export default function ResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError("");

      const [examRes, studentRes] = await Promise.all([
        fetch("/api/examinations"),
        fetch("/api/students"),
      ]);

      const [examData, studentData] = await Promise.all([
        examRes.json(),
        studentRes.json(),
      ]);

      if (!examRes.ok || !Array.isArray(examData)) {
        throw new Error(examData.error || "Unable to load examinations.");
      }

      if (!studentRes.ok || !Array.isArray(studentData)) {
        throw new Error(studentData.error || "Unable to load students.");
      }

      setExams(examData);
      setStudents(studentData);

      if (examData.length > 0) {
        setSelectedExam(examData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedExam) {
      setResults([]);
      setMarks({});
      return;
    }

    async function fetchResults() {
      try {
        setError("");

        const response = await fetch(
          `/api/results?examId=${selectedExam}`
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data.error || "Unable to load results.");
        }

        setResults(data);

        const existingMarks: Record<string, string> = {};

        data.forEach((result: Result) => {
          existingMarks[result.studentId] = String(result.marksObtained);
        });

        setMarks(existingMarks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load results.");
      }
    }

    fetchResults();
  }, [selectedExam]);

  const currentExam = exams.find((exam) => exam.id === selectedExam);

  const classStudents = currentExam
    ? students.filter(
        (student) => student.classId === currentExam.subject.classId
      )
    : [];

  function calculateGrade(value: number) {
    if (!currentExam || currentExam.totalMarks <= 0) return "-";

    const percentage = (value / currentExam.totalMarks) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  }

  async function handleSaveResults() {
    if (!currentExam) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const studentsToSave = classStudents.filter(
        (student) => marks[student.id] !== undefined &&
          marks[student.id].trim() !== ""
      );

      if (studentsToSave.length === 0) {
        throw new Error("Please enter marks for at least one student.");
      }

      const invalidStudent = studentsToSave.find((student) => {
        const value = Number(marks[student.id]);

        return (
          !Number.isFinite(value) ||
          value < 0 ||
          value > currentExam.totalMarks
        );
      });

      if (invalidStudent) {
        throw new Error(
          `Enter valid marks between 0 and ${currentExam.totalMarks} for all students.`
        );
      }

      const responses = await Promise.all(
        studentsToSave.map((student) =>
          fetch("/api/results", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              studentId: student.id,
              examId: currentExam.id,
              marksObtained: Number(marks[student.id]),
            }),
          })
        )
      );

      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        const result = await failedResponse.json();
        throw new Error(result.error || "Some results could not be saved.");
      }

      setMessage("Student results saved successfully!");

      const resultResponse = await fetch(
        `/api/results?examId=${selectedExam}`
      );

      const resultData = await resultResponse.json();

      if (resultResponse.ok && Array.isArray(resultData)) {
        setResults(resultData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save results.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Student Results
          </h1>
          <p className="text-slate-500 mt-2">
            Enter marks and manage examination results.
          </p>
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

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Examination
          </label>

          <select
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              setMessage("");
              setError("");
            }}
            className="w-full md:w-1/2 border rounded-lg p-3 text-slate-800"
          >
            <option value="">Choose Examination</option>

            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} - {exam.subject.name}
              </option>
            ))}
          </select>

          {currentExam && (
            <div className="mt-4 text-slate-600 space-y-1">
              <p>
                <strong>Subject:</strong> {currentExam.subject.name}
              </p>
              <p>
                <strong>Class:</strong>{" "}
                {currentExam.subject.academicClass.name} -{" "}
                {currentExam.subject.academicClass.section}
              </p>
              <p>
                <strong>Total Marks:</strong> {currentExam.totalMarks}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-800">
              Student Marks
            </h2>

            <span className="text-sm text-slate-500">
              {results.length} saved results
            </span>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Loading data...</p>
          ) : !selectedExam ? (
            <p className="p-6 text-slate-500">
              Please create an examination first.
            </p>
          ) : classStudents.length === 0 ? (
            <p className="p-6 text-slate-500">
              No students are assigned to this examination's class.
              Please assign students in Students Management.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-4">Admission No.</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Marks Obtained</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Result Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classStudents.map((student) => {
                      const value = marks[student.id];
                      const numericMarks = Number(value);
                      const hasMarks =
                        value !== undefined && value.trim() !== "";
                      const validMarks =
                        hasMarks &&
                        Number.isFinite(numericMarks) &&
                        numericMarks >= 0 &&
                        numericMarks <= currentExam!.totalMarks;

                      return (
                        <tr key={student.id} className="border-t">
                          <td className="p-4 text-slate-600">
                            {student.admissionNo}
                          </td>

                          <td className="p-4 font-medium text-slate-800">
                            {student.firstName} {student.lastName}
                          </td>

                          <td className="p-4">
                            <input
                              type="number"
                              min="0"
                              max={currentExam!.totalMarks}
                              step="any"
                              value={value ?? ""}
                              onChange={(e) =>
                                setMarks((previous) => ({
                                  ...previous,
                                  [student.id]: e.target.value,
                                }))
                              }
                              placeholder="Enter marks"
                              className="w-32 border rounded-lg p-2 text-slate-800"
                            />
                          </td>

                          <td className="p-4 font-semibold text-slate-700">
                            {validMarks
                              ? calculateGrade(numericMarks)
                              : "-"}
                          </td>

                          <td className="p-4">
                            {validMarks ? (
                              <span className="text-green-700 font-medium">
                                Entered
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6">
                <button
                  onClick={handleSaveResults}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Results"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
