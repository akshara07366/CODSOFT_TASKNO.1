
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// GET: Fetch all classes
export async function GET() {
  try {
    const classes = await prisma.academicClass.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Class fetching error:", error);
    return NextResponse.json(
      { error: "Unable to fetch classes." },
      { status: 500 }
    );
  }
}

// POST: Add a new class
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newClass = await prisma.academicClass.create({
      data: {
        name: body.name,
        section: body.section,
        academicYear: body.academicYear,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Class creation error:", error);
    return NextResponse.json(
      { error: "Unable to add class. Check the details and try again." },
      { status: 500 }
    );
  }
}
