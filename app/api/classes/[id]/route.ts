
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// UPDATE class
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedClass = await prisma.academicClass.update({
      where: { id },
      data: {
        name: body.name,
        section: body.section,
        academicYear: body.academicYear,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Class update error:", error);
    return NextResponse.json(
      { error: "Unable to update class." },
      { status: 500 }
    );
  }
}

// DELETE class
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.academicClass.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Class deleted successfully.",
    });
  } catch (error) {
    console.error("Class deletion error:", error);
    return NextResponse.json(
      { error: "Unable to delete class. It may contain linked records." },
      { status: 500 }
    );
  }
}
