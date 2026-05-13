"use client";

import { useState } from "react";

export function SupplierStatusActions({
  supplierId,
  currentStatus,
}: {
  supplierId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: "VERIFIED" | "REJECTED") {
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to update supplier status");
      }

      setStatus(nextStatus);
      setMessage(`Updated to ${nextStatus}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-600">{status}</span>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus("VERIFIED")}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Approve
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus("REJECTED")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}