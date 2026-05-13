"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Deal = {
  id: string;
  status: string;
  agreedPriceUsdPerKg: number | null;
  agreedVolumeMt: number | null;
  totalValueUsd: number | null;
  platformFeeUsd: number | null;
  feePaidAt: string | null;
  updatedAt: string;
  match: {
    rfq: { mineralType: string; importer: { companyName: string } };
    supplier: { companyName: string; country: string };
  };
};

const STATUS_ORDER = [
  "INTRO_SENT",
  "QUOTE_RECEIVED",
  "TERMS_AGREED",
  "DOCS_PENDING",
  "DOCS_COMPLETE",
  "PAYMENT_PENDING",
  "CLOSED",
];

const STATUS_LABELS: Record<string, string> = {
  INTRO_SENT:      "Intro sent",
  QUOTE_RECEIVED:  "Quoted",
  TERMS_AGREED:    "Terms agreed",
  DOCS_PENDING:    "Docs pending",
  DOCS_COMPLETE:   "Docs complete",
  PAYMENT_PENDING: "Fee pending",
  CLOSED:          "Closed ✓",
};

const STATUS_COLOR: Record<string, string> = {
  INTRO_SENT:      "bg-gray-100 text-gray-600",
  QUOTE_RECEIVED:  "bg-blue-50 text-blue-700",
  TERMS_AGREED:    "bg-purple-50 text-purple-700",
  DOCS_PENDING:    "bg-yellow-50 text-yellow-700",
  DOCS_COMPLETE:   "bg-teal-50 text-teal-700",
  PAYMENT_PENDING: "bg-orange-50 text-orange-700",
  CLOSED:          "bg-green-50 text-green-700",
};

function fmt(n: number | null, decimals = 0) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Deal row ─────────────────────────────────────────────────────────────────

function DealRow({ deal }: { deal: Deal }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [totalValue, setTotalValue] = useState("");

  const currentIdx = STATUS_ORDER.indexOf(deal.status);
  const nextStatus = STATUS_ORDER[currentIdx + 1];

  async function advance() {
    if (!nextStatus) return;
    setUpdating(true);
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
    setUpdating(false);
  }

  async function closeDeal() {
    const val = parseFloat(totalValue);
    if (!val || val <= 0) return;
    setUpdating(true);
    await fetch(`/api/deals/${deal.id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalValueUsd: val }),
    });
    router.refresh();
    setShowClose(false);
    setUpdating(false);
  }

  return (
    <div className="px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">
              {deal.match.rfq.mineralType.replace(/_/g, " ")}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[deal.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[deal.status] ?? deal.status}
            </span>
            {deal.totalValueUsd && (
              <span className="text-xs font-medium text-gray-700">{fmt(deal.totalValueUsd)}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.match.supplier.companyName} ({deal.match.supplier.country}) →{" "}
            {deal.match.rfq.importer.companyName}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {deal.platformFeeUsd && (
              <span className="text-xs text-gray-400">
                fee: {fmt(deal.platformFeeUsd)}
                {deal.feePaidAt ? " ✓ paid" : " pending"}
              </span>
            )}
            <span className="text-xs text-gray-400">
              updated {new Date(deal.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="flex gap-0.5 mt-2">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className={`h-1 rounded-full flex-1 ${i <= currentIdx ? "bg-teal-400" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {deal.status !== "CLOSED" && nextStatus && nextStatus !== "CLOSED" && (
            <button onClick={advance} disabled={updating}
              className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:border-teal-400 hover:text-teal-700 transition-colors whitespace-nowrap disabled:opacity-50">
              {updating ? "…" : `→ ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
          {deal.status === "DOCS_COMPLETE" && (
            <button onClick={() => setShowClose(!showClose)}
              className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-colors">
              Close deal
            </button>
          )}
          <a href={`/admin/deals/${deal.id}`}
            className="text-xs text-gray-400 hover:text-gray-600 underline">
            Open →
          </a>
        </div>
      </div>

      {/* Close deal panel */}
      {showClose && (
        <div className="mt-3 bg-teal-50 border border-teal-200 rounded-xl p-3">
          <p className="text-xs font-medium text-teal-900 mb-2">
            Enter agreed total deal value to calculate and invoice the platform fee (1.5%).
          </p>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1.5 text-sm text-gray-400">$</span>
              <input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="e.g. 2500000"
                className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {totalValue && (
              <span className="text-xs text-teal-700 whitespace-nowrap">
                fee: {fmt(parseFloat(totalValue) * 0.015)}
              </span>
            )}
            <button onClick={closeDeal} disabled={updating || !totalValue}
              className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
              {updating ? "…" : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export function DealPipeline({ deals }: { deals: Deal[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? deals : deals.filter((d) => d.status === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="px-5 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
        {["all", ...STATUS_ORDER].map((s) => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors border
              ${filter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {s === "all" ? "All" : STATUS_LABELS[s]}
            {s !== "all" && (
              <span className="ml-1 opacity-60">
                {deals.filter((d) => d.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No deals in this stage.
        </div>
      )}

      {filtered.map((d) => (
        <DealRow key={d.id} deal={d} />
      ))}
    </div>
  );
}
