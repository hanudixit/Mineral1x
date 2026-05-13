"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Importer = {
  companyName: string;
  country: string;
  industryVertical: string;
};

type RFQ = {
  id: string;
  mineralType: string;
  volumeMt: number;
  purityPercent: number | null;
  targetPriceUsdPerKg: number | null;
  deliveryDeadline: string | null;
  endUseCategory: string;
  status: string;
  createdAt: string;
  preferredCountries: string[];
  excludedCountries: string[];
  importer: Importer;
  matches: { id: string }[];
};

type Supplier = {
  id: string;
  companyName: string;
  country: string;
  minerals: { mineralType: string; minOrderMt: number }[];
};

const VERTICAL_LABELS: Record<string, string> = {
  DEFENSE_AEROSPACE: "Defense / Aerospace",
  EV_BATTERY: "EV / Battery",
  SEMICONDUCTOR: "Semiconductor",
  WIND_ENERGY: "Wind energy",
  CONSUMER_ELECTRONICS: "Consumer electronics",
  MEDICAL_DEVICES: "Medical devices",
  INDUSTRIAL_MANUFACTURING: "Industrial",
  OTHER: "Other",
};

// ─── Match assignment modal ───────────────────────────────────────────────────

function MatchModal({ rfq, onClose }: { rfq: RFQ; onClose: () => void }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/suppliers?mineral=${rfq.mineralType}&pageSize=50`)
      .then((r) => r.json())
      .then((d) => { setSuppliers(d.suppliers ?? []); setFetching(false); });
  }, [rfq.mineralType]);

  async function createMatch() {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfqId: rfq.id,
        supplierId: selected,
        matchNotes: notes,
        sendIntroNow: true,
      }),
    });
    if (res.ok) {
      router.refresh();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Match supplier — {rfq.mineralType.replace(/_/g, " ")} ({Number(rfq.volumeMt)} MT)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {rfq.importer.companyName} · {VERTICAL_LABELS[rfq.endUseCategory] ?? rfq.endUseCategory}
          </p>
        </div>

        <div className="px-6 py-4 max-h-72 overflow-y-auto">
          {fetching && <p className="text-sm text-gray-400">Loading verified suppliers…</p>}
          {!fetching && suppliers.length === 0 && (
            <p className="text-sm text-red-500">
              No verified suppliers found for {rfq.mineralType}. You may need to onboard suppliers for this mineral first.
            </p>
          )}
          {suppliers.map((s) => {
            const alreadyMatched = rfq.matches.length > 0; // simplified check
            return (
              <label key={s.id}
                className={`flex items-start gap-3 p-3 rounded-xl mb-2 cursor-pointer border transition-colors
                  ${selected === s.id ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input type="radio" name="supplier" value={s.id}
                  checked={selected === s.id}
                  onChange={() => setSelected(s.id)}
                  className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.companyName}</p>
                  <p className="text-xs text-gray-500">{s.country}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.minerals.slice(0, 3).map((m) => (
                      <span key={m.mineralType} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {m.mineralType.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="px-6 pb-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Match notes (optional) — why this supplier?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={createMatch} disabled={!selected || loading}
            className="text-sm bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {loading ? "Sending intro…" : "Match and send intro emails"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single RFQ row ───────────────────────────────────────────────────────────

function RFQRow({ rfq }: { rfq: RFQ }) {
  const [modalOpen, setModalOpen] = useState(false);

  const daysOld = Math.floor(
    (Date.now() - new Date(rfq.createdAt).getTime()) / 86_400_000
  );

  return (
    <>
      <div className="px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">
                {rfq.mineralType.replace(/_/g, " ")}
              </span>
              <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {Number(rfq.volumeMt)} MT
              </span>
              {rfq.targetPriceUsdPerKg && (
                <span className="text-xs text-gray-500">
                  target ${Number(rfq.targetPriceUsdPerKg).toFixed(2)}/kg
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {rfq.importer.companyName} · {rfq.importer.country} ·{" "}
              {VERTICAL_LABELS[rfq.endUseCategory] ?? rfq.endUseCategory}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {rfq.deliveryDeadline && (
                <span className="text-xs text-gray-400">
                  needed by {new Date(rfq.deliveryDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              {rfq.excludedCountries.includes("CN") && (
                <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">ex-China</span>
              )}
              {rfq.preferredCountries.length > 0 && (
                <span className="text-xs text-gray-400">
                  pref: {rfq.preferredCountries.join(", ")}
                </span>
              )}
              <span className={`text-xs ${daysOld > 2 ? "text-red-500" : "text-gray-400"}`}>
                {daysOld === 0 ? "today" : `${daysOld}d ago`}
              </span>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="shrink-0 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
            Match →
          </button>
        </div>
      </div>

      {modalOpen && (
        <MatchModal rfq={rfq} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export function RFQQueue({ rfqs }: { rfqs: RFQ[] }) {
  if (rfqs.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-gray-400">
        No open RFQs right now.
      </div>
    );
  }

  return (
    <div>
      {rfqs.map((rfq) => (
        <RFQRow key={rfq.id} rfq={rfq} />
      ))}
    </div>
  );
}
