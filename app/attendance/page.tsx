
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
  classId: string | null;
};

type AttendanceRecord = {
  id?: string;
  studentId: string;
  status: string;
  remarks: string;
};

export default function AttendancePage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Set today's date after the page loads
  useEffect(() => {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setSelectedDate(localDate);
  }, []);

  // Fetch classes and students
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [classResponse, studentResponse] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/students"),
        ]);

        const classData = await classResponse.json();
        const studentData = await studentResponse.json();

        if (!classResponse.ok) {
          throw new Error(classData.error || "Unable to load classes");
        }

        if (!studentResponse.ok) {
          throw new Error(studentData.error || "Unable to load students");
        }

        setClasses(classData);
        setStudents(studentData);

        if (classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load initial data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Students belonging to the selected class
  const classStudents = students.filter(
    (student) => student.classId === selectedClass
  );

  // Fetch existing attendance for selected class and date
  useEffect(() => {
    if (!selectedClass || !selectedDate || loading) return;

    let cancelled = false;

    async function fetchAttendance() {
      try {
        setMessage("");

        const response = await fetch(
          `/api/attendance?classId=${selectedClass}&date=${selectedDate}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to fetch attendance");
        }

        if (cancelled) return;

        const updatedRecords: Record<string, AttendanceRecord> = {};

        classStudents.forEach((student) => {
          const existing = result.find(
            (record: any) => record.studentId === student.id
          );

          updatedRecords[student.id] = {
            id: existing?.id,
            studentId: student.id,
            status: existing?.status || "",
            remarks: existing?.remarks || "",
          };
        });

        setRecords(updatedRecords);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load attendance"
          );
        }
      }
    }

    fetchAttendance();

    return () => {
      cancelled = true;
    };
  }, [selectedClass, selectedDate, students, loading]);

  // Update attendance status
  function updateStatus(studentId: string, status: string) {
    setRecords((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        studentId,
        status,
      },
    }));
  }

  // Update remarks
  function updateRemarks(studentId: string, remarks: string) {
    setRecords((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        studentId,
        status: previous[studentId]?.status || "",
        remarks,
      },
    }));
  }

  // Save attendance
  async function handleSaveAttendance() {
    if (!selectedClass || !selectedDate) {
      setMessage("Please select a class and date.");
      return;
    }

    if (classStudents.length === 0) {
      setMessage("No students are assigned to this class.");
      return;
    }

    const attendanceRecords = classStudents.map((student) => ({
      studentId: student.id,
      status: records[student.id]?.status || "",
      remarks: records[student.id]?.remarks || "",
    }));

    const incomplete = attendanceRecords.some(
      (record) => !record.status
    );

    if (incomplete) {
      setMessage("Please mark attendance for every student.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          records: attendanceRecords,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save attendance");
      }

      setMessage("Attendance saved successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save attendance"
      );
    } finally {
      setSaving(false);
    }
  }

  const presentCount = classStudents.filter(
    (student) => records[student.id]?.status === "PRESENT"
  ).length;

  const absentCount = classStudents.filter(
    (student) => records[student.id]?.status === "ABSENT"
  ).length;

  const lateCount = classStudents.filter(
    (student) => records[student.id]?.status === "LATE"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Attendance Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and record daily student attendance.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-white p-4 text-slate-700">
            {message}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Select Class
            </label>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Class</option>

              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} - Section {schoolClass.section} (
                  {schoolClass.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6">
            Loading attendance data...
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-slate-600">
            No classes available. Please create a class first.
          </div>
        ) : !selectedClass ? (
          <div className="rounded-xl bg-white p-6 text-slate-600">
            Please select a class.
          </div>
        ) : classStudents.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-slate-600">
            No students found in this class. Please assign students to this
            class from the Students page.
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Present</p>
                <h2 className="mt-2 text-2xl font-bold text-green-600">
                  {presentCount}
                </h2>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Absent</p>
                <h2 className="mt-2 text-2xl font-bold text-red-600">
                  {absentCount}
                </h2>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Late</p>
                <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                  {lateCount}
                </h2>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-slate-800">
                Student Attendance
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="p-3">Admission No.</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classStudents.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="p-3">{student.admissionNo}</td>

                        <td className="p-3">
                          {student.firstName} {student.lastName}
                        </td>

                        <td className="p-3">
                          <select
                            value={records[student.id]?.status || ""}
                            onChange={(e) =>
                              updateStatus(student.id, e.target.value)
                            }
                            className="rounded-lg border p-2"
                          >
                            <option value="">Select Status</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                          </select>
                        </td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={records[student.id]?.remarks || ""}
                            onChange={(e) =>
                              updateRemarks(student.id, e.target.value)
                            }
                            placeholder="Optional remarks"
                            className="w-full rounded-lg border p-2"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
