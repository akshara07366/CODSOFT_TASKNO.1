
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// GET: Retrieve all students with their class
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        academicClass: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Student fetching error:", error);

    return NextResponse.json(
      { error: "Unable to fetch students." },
      { status: 500 }
    );
  }
}

// POST: Add a new student
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const student = await prisma.student.create({
      data: {
        admissionNo: body.admissionNo,
        firstName: body.firstName,
        lastName: body.lastName,
        dob: body.dob ? new Date(body.dob) : null,
        gender: body.gender || null,
        phone: body.phone || null,
        address: body.address || null,
        classId: body.classId || null,
      },
      include: {
        academicClass: true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Student creation error:", error);

    return NextResponse.json(
      { error: "Unable to create student. Check the details and try again." },
      { status: 500 }
    );
  }
}
