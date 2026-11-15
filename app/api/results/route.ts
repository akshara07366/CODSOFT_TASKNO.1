
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// Calculate grade
function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

// Get results
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    const results = await prisma.result.findMany({
      where: examId ? { examId } : {},
      include: {
        student: true,
        exam: {
          include: {
            subject: {
              include: {
                academicClass: true,
              },
            },
          },
        },
      },
      orderBy: {
        marksObtained: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Results fetching error:", error);

    return NextResponse.json(
      { error: "Unable to fetch results." },
      { status: 500 }
    );
  }
}

// Add or update student result
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { studentId, examId, marksObtained } = body;
    const marks = Number(marksObtained);

    if (
      !studentId ||
      !examId ||
      marksObtained === undefined ||
      !Number.isFinite(marks) ||
      marks < 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid student, examination and marks." },
        { status: 400 }
      );
    }

    const [student, exam] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
      }),
      prisma.exam.findUnique({
        where: { id: examId },
        include: { subject: true },
      }),
    ]);

    if (!student || !exam) {
      return NextResponse.json(
        { error: "Student or examination not found." },
        { status: 404 }
      );
    }

    if (student.classId !== exam.subject.classId) {
      return NextResponse.json(
        { error: "This student does not belong to the examination's class." },
        { status: 400 }
      );
    }

    if (marks > exam.totalMarks) {
      return NextResponse.json(
        { error: "Marks cannot exceed total examination marks." },
        { status: 400 }
      );
    }

    const percentage = (marks / exam.totalMarks) * 100;
    const grade = calculateGrade(percentage);

    const result = await prisma.result.upsert({
      where: {
        studentId_examId: {
          studentId,
          examId,
        },
      },
      update: {
        marksObtained: marks,
        grade,
      },
      create: {
        studentId,
        examId,
        marksObtained: marks,
        grade,
      },
      include: {
        student: true,
        exam: true,
      },
    });

    return NextResponse.json(
      {
        message: "Result saved successfully.",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Result saving error:", error);

    return NextResponse.json(
      { error: "Unable to save result." },
      { status: 500 }
    );
  }
}
