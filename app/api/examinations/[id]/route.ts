
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// Update examination
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const examination = await prisma.exam.update({
      where: { id },
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

    return NextResponse.json({
      message: "Examination updated successfully.",
      examination,
    });
  } catch (error) {
    console.error("Examination update error:", error);

    return NextResponse.json(
      { error: "Unable to update examination." },
      { status: 500 }
    );
  }
}

// Delete examination and its associated results
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction([
      prisma.result.deleteMany({
        where: { examId: id },
      }),
      prisma.exam.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: "Examination and associated results deleted successfully.",
    });
  } catch (error) {
    console.error("Examination deletion error:", error);

    return NextResponse.json(
      { error: "Unable to delete examination." },
      { status: 500 }
    );
  }
}
