
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// UPDATE student
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const student = await prisma.student.update({
      where: { id },
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

    return NextResponse.json(student);
  } catch (error) {
    console.error("Student update error:", error);

    return NextResponse.json(
      { error: "Unable to update student." },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Student deletion error:", error);

    return NextResponse.json(
      { error: "Unable to delete student." },
      { status: 500 }
    );
  }
}
