
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// Get all examinations
export async function GET() {
  try {
    const examinations = await prisma.exam.findMany({
      include: {
        subject: {
          include: {
            academicClass: true,
            teacher: true,
          },
        },
        results: true,
      },
      orderBy: {
        examDate: "desc",
      },
    });

    return NextResponse.json(examinations);
  } catch (error) {
    console.error("Examination fetching error:", error);

    return NextResponse.json(
      { error: "Unable to fetch examinations." },
      { status: 500 }
    );
  }
}

// Create a new examination
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, examDate, totalMarks, subjectId } = body;

    if (!title || !examDate || !subjectId || totalMarks === undefined) {
      return NextResponse.json(
        { error: "Please provide all examination details." },
        { status: 400 }
      );
    }

    const marks = Number(totalMarks);
    const parsedDate = new Date(examDate);

    if (
      !Number.isFinite(marks) ||
      marks <= 0 ||
      Number.isNaN(parsedDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Please provide a valid date and total marks." },
        { status: 400 }
      );
    }

    const examination = await prisma.exam.create({
      data: {
        title,
        examDate: parsedDate,
        totalMarks: marks,
        subjectId,
      },
      include: {
        subject: {
          include: {
            academicClass: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Examination created successfully.",
        examination,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Examination creation error:", error);

    return NextResponse.json(
      { error: "Unable to create examination." },
      { status: 500 }
    );
  }
}
