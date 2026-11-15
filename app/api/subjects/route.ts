
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// Get all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        academicClass: true,
        teacher: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Subject fetching error:", error);

    return NextResponse.json(
      { error: "Unable to fetch subjects." },
      { status: 500 }
    );
  }
}

// Add a new subject
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, code, classId, teacherId } = body;

    if (!name || !code || !classId) {
      return NextResponse.json(
        { error: "Subject name, code and class are required." },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        teacherId: teacherId || null,
      },
      include: {
        academicClass: true,
        teacher: true,
      },
    });

    return NextResponse.json(
      {
        message: "Subject added successfully.",
        subject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subject creation error:", error);

    return NextResponse.json(
      { error: "Unable to add subject. Check whether the subject code already exists." },
      { status: 500 }
    );
  }
}
