import { NextResponse } from "next/server";
import prisma from "@/app/components/lib/prisma";

export async function GET() {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalExaminations,
      invoiceTotal,
      paymentTotal,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.academicClass.count(),
      prisma.subject.count(),
      prisma.exam.count(),
      prisma.feeInvoice.aggregate({
        _sum: { amount: true },
      }),
      prisma.feePayment.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const totalFees = Number(invoiceTotal._sum.amount ?? 0);
    const feesCollected = Number(paymentTotal._sum.amount ?? 0);
    const remainingFees = totalFees - feesCollected;

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalExaminations,
      totalFees,
      feesCollected,
      remainingFees,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Unable to load dashboard statistics." },
      { status: 500 }
    );
  }
}
