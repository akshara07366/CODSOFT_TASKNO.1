
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// Update subject
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, code, classId, teacherId } = body;

    if (!name || !code || !classId) {
      return NextResponse.json(
        { error: "Subject name, code and class are required." },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.update({
      where: { id },
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

    return NextResponse.json({
      message: "Subject updated successfully.",
      subject,
    });
  } catch (error) {
    console.error("Subject update error:", error);

    return NextResponse.json(
      { error: "Unable to update subject. Check whether the subject code already exists." },
      { status: 500 }
    );
  }
}

// Delete subject
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Subject deleted successfully.",
    });
  } catch (error) {
    console.error("Subject deletion error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to delete subject. It may already be linked to an examination.",
      },
      { status: 500 }
    );
  }
}
