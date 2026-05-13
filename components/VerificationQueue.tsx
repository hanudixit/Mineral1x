"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Certification = {
  id: string;
  certType: string;
  issuerName: string;
  expiresAt: string | null;
  verifiedByAdmin: boolean;
};

type MineralListing = {
  id: string;
  mineralType: string;
  minOrderMt: number;
  country?: string;
};

type Supplier = {
  id: string;
  companyName: string;
  country: string;
  contactName: string;
  contactEmail: string;
  status: string;
  createdAt: string;
  certifications: Certification[];
  minerals: MineralListing[];
  description?: string | null;
  website?: string | null;
};

const CERT_LABELS: Record<string, string> = {
  COUNTRY_OF_ORIGIN: "CoO cert",
  EXPORT_LICENSE: "Export licence",
  ISO_9001: "ISO 9001",
  ISO_14001: "ISO 14001",
  CONFLICT_FREE: "Conflict-free",
  FORGE_MEMBER: "FORGE member",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DOCS_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── Single supplier card ─────────────────────────────────────────────────────

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "request_docs" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const daysPending = Math.floor(
    (Date.now() - new Date(supplier.createdAt).getTime()) / 86_400_000
  );

  async function submit() {
    if (!action) return;
    if ((action === "reject" || action === "request_docs") && note.trim().length < 10) return;
    setLoading(true);

    const body =
      action === "approve"
        ? { action }
        : action === "reject"
        ? { action, reason: note }
        : { action, note };

    const res = await fetch(`/api/admin/suppliers/${supplier.id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="px-5 py-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border-b border-gray-100">
        <span>✓</span>
        <span>{supplier.companyName} — action recorded.</span>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{supplier.companyName}</span>
              <span className="text-xs text-gray-400">{supplier.country}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[supplier.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                {supplier.status.replace("_", " ").toLowerCase()}
              </span>
              {daysPending > 1 && (
                <span className="text-xs text-red-500">{daysPending}d waiting</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{supplier.contactName} · {supplier.contactEmail}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400">
              {supplier.certifications.length} cert{supplier.certifications.length !== 1 ? "s" : ""} ·{" "}
              {supplier.minerals.length} mineral{supplier.minerals.length !== 1 ? "s" : ""}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5">
          {supplier.description && (
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">{supplier.description}</p>
          )}

          {/* Minerals */}
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Minerals listed</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {supplier.minerals.map((m) => (
              <span key={m.id} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded-lg">
                {m.mineralType.replace(/_/g, " ")} · min {Number(m.minOrderMt)} MT
              </span>
            ))}
          </div>

          {/* Certifications */}
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Certifications</p>
          <div className="space-y-1 mb-5">
            {supplier.certifications.length === 0 && (
              <p className="text-sm text-red-500">No certifications uploaded</p>
            )}
            {supplier.certifications.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{CERT_LABELS[c.certType] ?? c.certType}</span>
                <div className="flex items-center gap-3">
                  {c.expiresAt && (
                    <span className="text-xs text-gray-400">
                      exp {new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  )}
                  <a href={`/api/admin/suppliers/${supplier.id}/docs/${c.id}`}
                    className="text-xs text-teal-600 hover:text-teal-700 underline" target="_blank">
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {!action && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setAction("approve")}
                className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
                Approve
              </button>
              <button onClick={() => setAction("request_docs")}
                className="text-sm border border-orange-300 text-orange-700 px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                Request docs
              </button>
              <button onClick={() => setAction("reject")}
                className="text-sm border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                Reject
              </button>
            </div>
          )}

          {/* Confirm panel */}
          {action === "approve" && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm font-medium text-teal-900 mb-3">
                Approve {supplier.companyName}? Their listing will go live and they'll receive an email.
              </p>
              <div className="flex gap-2">
                <button onClick={submit} disabled={loading}
                  className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {loading ? "Approving…" : "Confirm approval"}
                </button>
                <button onClick={() => setAction(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            </div>
          )}

          {(action === "reject" || action === "request_docs") && (
            <div className={`rounded-xl p-4 border ${action === "reject" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
              <p className="text-sm font-medium mb-2">
                {action === "reject" ? "Reason for rejection" : "What additional documents are needed?"}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={action === "reject"
                  ? "e.g. Country of origin certificate missing, unable to verify export licence..."
                  : "e.g. Please upload your export licence from the Department of Resources..."}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-3 bg-white"
              />
              <div className="flex gap-2">
                <button onClick={submit} disabled={loading || note.trim().length < 10}
                  className={`text-sm text-white px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors ${action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                  {loading ? "Sending…" : action === "reject" ? "Confirm rejection" : "Send request"}
                </button>
                <button onClick={() => { setAction(null); setNote(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Queue list ───────────────────────────────────────────────────────────────

export function VerificationQueue({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-gray-400">
        No pending verifications — inbox zero 🎉
      </div>
    );
  }

  return (
    <div>
      {suppliers.map((s) => (
        <SupplierCard key={s.id} supplier={s} />
      ))}
    </div>
  );
}
