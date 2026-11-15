
import { NextResponse } from "next/server";
import prisma from "../../../components/lib/prisma";

// UPDATE attendance
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validStatuses = ["PRESENT", "ABSENT", "LATE"];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid attendance status." },
        { status: 400 }
      );
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status: body.status,
        remarks: body.remarks || null,
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error("Attendance update error:", error);

    return NextResponse.json(
      { error: "Unable to update attendance." },
      { status: 500 }
    );
  }
}

// DELETE attendance
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    console.error("Attendance deletion error:", error);

    return NextResponse.json(
      { error: "Unable to delete attendance record." },
      { status: 500 }
    );
  }
}
