import { NextResponse } from "next/server";
import prisma from "@/app/components/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.feeInvoice.findMany({
      include: {
        student: {
          include: {
            academicClass: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Fetch fees error:", error);
    return NextResponse.json(
      { message: "Unable to fetch fee records." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { invoiceNumber, studentId, amount, dueDate } = body;

    if (!invoiceNumber || !studentId || !amount || !dueDate) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const feeAmount = Number(amount);
    const parsedDueDate = new Date(dueDate);

    if (!Number.isFinite(feeAmount) || feeAmount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid fee amount." },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { message: "Please enter a valid due date." },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    const invoice = await prisma.feeInvoice.create({
      data: {
        invoiceNumber,
        studentId,
        amount: feeAmount,
        dueDate: parsedDueDate,
      },
      include: {
        student: true,
        payments: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);

    return NextResponse.json(
      { message: "Unable to create fee invoice. Check that the invoice number is unique." },
      { status: 500 }
    );
  }
}
