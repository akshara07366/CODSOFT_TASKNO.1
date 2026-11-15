
import { NextResponse } from "next/server";
import prisma from "../../components/lib/prisma";

// GET: Fetch attendance records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const classId = searchParams.get("classId");

    const where: any = {};

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (classId) {
      where.student = {
        is: {
          classId: classId,
        },
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            admissionNo: true,
            firstName: true,
            lastName: true,
            classId: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance fetching error:", error);

    return NextResponse.json(
      { error: "Unable to fetch attendance records." },
      { status: 500 }
    );
  }
}

// POST: Save attendance records
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { date, records } = body;

    if (!date || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Date and attendance records are required." },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid attendance date." },
        { status: 400 }
      );
    }

    const validStatuses = ["PRESENT", "ABSENT", "LATE"];

    for (const record of records) {
      if (
        !record.studentId ||
        !validStatuses.includes(record.status)
      ) {
        return NextResponse.json(
          { error: "Invalid student or attendance status." },
          { status: 400 }
        );
      }
    }

    const savedRecords = await Promise.all(
      records.map((record: any) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status as "PRESENT" | "ABSENT" | "LATE",
            remarks: record.remarks || null,
          },
          create: {
            studentId: record.studentId,
            date: attendanceDate,
            status: record.status as "PRESENT" | "ABSENT" | "LATE",
            remarks: record.remarks || null,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: "Attendance saved successfully.",
        attendance: savedRecords,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Attendance saving error:", error);

    return NextResponse.json(
      { error: "Unable to save attendance." },
      { status: 500 }
    );
  }
}
