
import { NextResponse } from "next/server";
import prisma from "@/app/components/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { invoiceId, amount, method, reference } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { message: "Invoice and payment amount are required." },
        { status: 400 }
      );
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { message: "Enter a valid payment amount." },
        { status: 400 }
      );
    }

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Fee invoice not found." },
        { status: 404 }
      );
    }

    const alreadyPaid = invoice.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

    const remaining = Number(invoice.amount) - alreadyPaid;

    if (paymentAmount > remaining) {
      return NextResponse.json(
        { message: `Payment cannot exceed the remaining balance of ${remaining}.` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.create({
        data: {
          invoiceId,
          amount: paymentAmount,
          method: method || null,
          reference: reference || null,
        },
      });

      const totalPaid = alreadyPaid + paymentAmount;
      const status = totalPaid >= Number(invoice.amount)
        ? "PAID"
        : "PENDING";

      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoiceId },
        data: { status },
      });

      return { payment, invoice: updatedInvoice };
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully.",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment error:", error);

    return NextResponse.json(
      { message: "Unable to record payment." },
      { status: 500 }
    );
  }
}
