
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// GET: Fetch all teachers
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Teacher fetching error:", error);
    return NextResponse.json(
      { error: "Unable to fetch teachers." },
      { status: 500 }
    );
  }
}

// POST: Add a new teacher
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const teacher = await prisma.teacher.create({
      data: {
        employeeId: body.employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error("Teacher creation error:", error);
    return NextResponse.json(
      { error: "Unable to add teacher. Check the details and try again." },
      { status: 500 }
    );
  }
}
