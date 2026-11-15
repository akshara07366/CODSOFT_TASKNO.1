
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
};

type Payment = {
  id: string;
  amount: number | string;
  paidAt: string;
  method: string | null;
  reference: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number | string;
  dueDate: string;
  status: string;
  student: Student;
  payments: Payment[];
};

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [paymentAmounts, setPaymentAmounts] = useState<
    Record<string, string>
  >({});

  const [paymentMethods, setPaymentMethods] = useState<
    Record<string, string>
  >({});

  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );

  async function loadData() {
    try {
      const [studentResponse, feeResponse] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/fees"),
      ]);

      if (!studentResponse.ok || !feeResponse.ok) {
        throw new Error("Unable to load student or fee records.");
      }

      const studentData = await studentResponse.json();
      const feeData = await feeResponse.json();

      setStudents(studentData);
      setInvoices(feeData);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateInvoice(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber,
          studentId,
          amount,
          dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create invoice.");
      }

      setMessage("Fee invoice created successfully!");

      setInvoiceNumber("");
      setStudentId("");
      setAmount("");
      setDueDate("");
      setShowForm(false);

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  async function handlePayment(invoiceId: string) {
    const paymentAmount = Number(paymentAmounts[invoiceId]);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setMessage("Please enter a valid payment amount.");
      return;
    }

    setMessage("");
    setProcessingPayment(invoiceId);

    try {
      const response = await fetch("/api/fees/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId,
          amount: paymentAmount,
          method: paymentMethods[invoiceId] || "Cash",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment could not be recorded.");
      }

      setPaymentAmounts((previous) => ({
        ...previous,
        [invoiceId]: "",
      }));

      setMessage("Payment recorded successfully!");

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to record payment."
      );
    } finally {
      setProcessingPayment(null);
    }
  }

  function getPaidAmount(invoice: Invoice) {
    return invoice.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
  }

  const totalFees = invoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const totalCollected = invoices.reduce(
    (total, invoice) => total + getPaidAmount(invoice),
    0
  );

  const pendingFees = totalFees - totalCollected;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Fees Management
            </h1>

            <p className="text-slate-500 mt-2">
              Manage student fee invoices and payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Fee Invoice"}
          </button>
        </div>

        {message && (
          <div className="mb-5 p-3 rounded-lg bg-blue-100 text-blue-800">
            {message}
          </div>
        )}

        {/* Fee Summary */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Total Fees</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-2">
              ₹{totalFees.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Fees Collected</p>
            <h2 className="text-2xl font-bold text-green-600 mt-2">
              ₹{totalCollected.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Pending Fees</p>
            <h2 className="text-2xl font-bold text-red-600 mt-2">
              ₹{pendingFees.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* Create Invoice Form */}

        {showForm && (
          <form
            onSubmit={handleCreateInvoice}
            className="bg-white p-6 rounded-xl shadow-sm mb-8"
          >
            <h2 className="text-xl font-semibold mb-5 text-slate-800">
              Create Fee Invoice
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice Number (e.g. INV-001)"
                className="border p-3 rounded-lg"
              />

              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} -{" "}
                    {student.admissionNo}
                  </option>
                ))}
              </select>

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Fee Amount"
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border p-3 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="mt-5 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Save Invoice
            </button>
          </form>
        )}

        {/* Fee Records */}

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <h2 className="text-xl font-semibold text-slate-800 p-6">
            Fee Records
          </h2>

          {loading ? (
            <p className="p-6 text-slate-500">
              Loading fee records...
            </p>
          ) : invoices.length === 0 ? (
            <p className="p-6 text-slate-500">
              No fee invoices found. Click Add Fee Invoice to create one.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => {
                  const paid = getPaidAmount(invoice);
                  const balance = Math.max(
                    0,
                    Number(invoice.amount) - paid
                  );

                  return (
                    <tr key={invoice.id} className="border-t">
                      <td className="p-4">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="p-4">
                        {invoice.student.firstName}{" "}
                        {invoice.student.lastName}
                      </td>

                      <td className="p-4">
                        ₹{Number(invoice.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-green-600">
                        ₹{paid.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-red-600">
                        ₹{balance.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        {new Date(invoice.dueDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            balance <= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {balance <= 0 ? "PAID" : "PENDING"}
                        </span>
                      </td>

                      <td className="p-4 min-w-56">
                        {balance > 0 ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              min="0.01"
                              max={balance}
                              step="0.01"
                              placeholder="Payment Amount"
                              value={paymentAmounts[invoice.id] || ""}
                              onChange={(e) =>
                                setPaymentAmounts((previous) => ({
                                  ...previous,
                                  [invoice.id]: e.target.value,
                                }))
                              }
                              className="border p-2 rounded w-full"
                            />

                            <select
                              value={
                                paymentMethods[invoice.id] || "Cash"
                              }
                              onChange={(e) =>
                                setPaymentMethods((previous) => ({
                                  ...previous,
                                  [invoice.id]: e.target.value,
                                }))
                              }
                              className="border p-2 rounded w-full"
                            >
                              <option value="Cash">Cash</option>
                              <option value="UPI">UPI</option>
                              <option value="Bank Transfer">
                                Bank Transfer
                              </option>
                              <option value="Card">Card</option>
                            </select>

                            <button
                              type="button"
                              disabled={processingPayment === invoice.id}
                              onClick={() => handlePayment(invoice.id)}
                              className="bg-blue-600 text-white px-3 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50"
                            >
                              {processingPayment === invoice.id
                                ? "Processing..."
                                : "Record Payment"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-green-600 font-medium">
                            Fully Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
