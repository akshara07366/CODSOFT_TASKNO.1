
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// UPDATE teacher
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        employeeId: body.employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Teacher update error:", error);
    return NextResponse.json(
      { error: "Unable to update teacher." },
      { status: 500 }
    );
  }
}

// DELETE teacher
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Teacher deleted successfully.",
    });
  } catch (error) {
    console.error("Teacher deletion error:", error);
    return NextResponse.json(
      { error: "Unable to delete teacher." },
      { status: 500 }
    );
  }
}
