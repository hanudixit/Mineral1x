"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  mineralType:         z.string().min(1, "Select a mineral"),
  purityPercent:       z.string().optional(),
  formFactor:          z.string().optional(),
  volumeMt:            z.string().min(1, "Required").refine((v) => parseFloat(v) > 0, "Must be positive"),
  targetPriceUsdPerKg: z.string().optional(),
  deliveryDeadline:    z.string().optional(),
  deliveryLocation:    z.string().optional(),
  endUseDeclaration:   z.string().min(20, "Please describe the end use in at least 20 characters — this is required for compliance"),
  endUseCategory:      z.string().min(1, "Select a category"),
  ultimateEndUser:     z.string().optional(),
  additionalNotes:     z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

const MINERALS = [
  { value: "NDFEB_MAGNET",   label: "NdFeB magnets (neodymium-iron-boron)" },
  { value: "NEODYMIUM",      label: "Neodymium (Nd)" },
  { value: "PRASEODYMIUM",   label: "Praseodymium (Pr)" },
  { value: "DYSPROSIUM",     label: "Dysprosium (Dy)" },
  { value: "TERBIUM",        label: "Terbium (Tb)" },
  { value: "LANTHANUM",      label: "Lanthanum (La)" },
  { value: "COBALT",         label: "Cobalt (Co)" },
  { value: "LITHIUM",        label: "Lithium (Li)" },
  { value: "GALLIUM",        label: "Gallium (Ga)" },
  { value: "GERMANIUM",      label: "Germanium (Ge)" },
  { value: "ANTIMONY",       label: "Antimony (Sb)" },
  { value: "TUNGSTEN",       label: "Tungsten (W)" },
  { value: "GRAPHITE",       label: "Graphite" },
  { value: "NICKEL",         label: "Nickel (Ni)" },
  { value: "MANGANESE",      label: "Manganese (Mn)" },
  { value: "OTHER",          label: "Other (describe in notes)" },
];

const END_USE_CATEGORIES = [
  { value: "DEFENSE_AEROSPACE",      label: "Defense / Aerospace" },
  { value: "EV_BATTERY",             label: "Electric vehicles / Battery manufacturing" },
  { value: "SEMICONDUCTOR",          label: "Semiconductor / Electronics" },
  { value: "WIND_ENERGY",            label: "Wind energy / Clean power" },
  { value: "CONSUMER_ELECTRONICS",   label: "Consumer electronics" },
  { value: "MEDICAL_DEVICES",        label: "Medical devices" },
  { value: "INDUSTRIAL_MANUFACTURING", label: "Industrial manufacturing" },
  { value: "OTHER",                  label: "Other" },
];

const INCOTERMS = ["FOB", "CIF", "DAP", "DDP", "EXW", "CPT", "FCA"];

function Field({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function SubmitRFQPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excludeChina, setExcludeChina] = useState(true);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { endUseDeclaration: "" },
  });

  const endUseText = watch("endUseDeclaration") ?? "";

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          volumeMt: parseFloat(data.volumeMt),
          purityPercent: data.purityPercent ? parseFloat(data.purityPercent) : undefined,
          targetPriceUsdPerKg: data.targetPriceUsdPerKg ? parseFloat(data.targetPriceUsdPerKg) : undefined,
          deliveryDeadline: data.deliveryDeadline ? new Date(data.deliveryDeadline).toISOString() : undefined,
          excludedCountries: excludeChina ? ["CN"] : [],
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.formErrors?.[0] ?? body.error ?? "Submission failed");
      }

      router.push("/importer/rfqs?submitted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/importer/rfqs" className="text-sm text-teal-600 hover:text-teal-700">← My RFQs</a>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Submit sourcing request</h1>
          <p className="text-sm text-gray-500 mt-1">
            We'll match you with 2–3 verified suppliers within 2 business days.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Mineral */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">What do you need?</p>

            <Field label="Mineral / product" error={errors.mineralType?.message} required>
              <select {...register("mineralType")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select mineral…</option>
                {MINERALS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
              <Field label="Volume (metric tonnes)" error={errors.volumeMt?.message} required>
                <input {...register("volumeMt")} type="number" step="0.001" min="0.001"
                  placeholder="e.g. 50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Purity (%)" hint="Optional — specify if critical">
                <input {...register("purityPercent")} type="number" step="0.001" min="0" max="100"
                  placeholder="e.g. 99.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Target price ($/kg)" hint="Optional budget indicator">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                  <input {...register("targetPriceUsdPerKg")} type="number" step="0.01" min="0"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </Field>
            </div>

            <Field label="Form factor / specification" hint="e.g. oxide powder, metal ingot, finished N52 magnet, battery-grade">
              <input {...register("formFactor")}
                placeholder="e.g. NdPr oxide, ≥99.5% purity, -325 mesh powder"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>

            {/* Delivery */}
            <div className="border-t border-gray-100 pt-4 mt-2 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Delivery</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label="Required by" hint="Leave blank if flexible">
                <input {...register("deliveryDeadline")} type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Delivery location">
                <input {...register("deliveryLocation")}
                  placeholder="e.g. Port of Los Angeles, CA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
            </div>

            {/* Sourcing policy */}
            <div className="border-t border-gray-100 pt-4 mt-2 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Sourcing preferences</p>
            </div>

            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={excludeChina} onChange={(e) => setExcludeChina(e.target.checked)}
                className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Exclude Chinese-origin suppliers</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Only show suppliers from FORGE/Pax Silica partner countries. Recommended for DoD-adjacent procurement.
                </p>
              </div>
            </label>

            {/* Compliance */}
            <div className="border-t border-gray-100 pt-4 mt-2 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Compliance — required
              </p>
            </div>

            <Field label="End-use category" error={errors.endUseCategory?.message} required>
              <select {...register("endUseCategory")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select category…</option>
                {END_USE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field
              label="End-use declaration"
              error={errors.endUseDeclaration?.message}
              required
              hint="Stored permanently on this RFQ. Required for export licence compliance on the supplier side.">
              <textarea
                {...register("endUseDeclaration")}
                rows={4}
                placeholder="Describe specifically how these minerals will be used. For example: 'NdFeB magnets will be incorporated into electric motor assemblies for our EV traction drive units manufactured at our facility in Detroit, Michigan. Materials will not be re-exported or transferred to third parties without prior written consent.'"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${endUseText.length < 20 ? "text-red-400" : "text-gray-400"}`}>
                  {endUseText.length} chars {endUseText.length < 20 ? `(${20 - endUseText.length} more needed)` : "✓"}
                </span>
              </div>
            </Field>

            <Field label="Ultimate end-user" hint="If different from your company — e.g. a government customer or sub-contractor">
              <input {...register("ultimateEndUser")}
                placeholder="e.g. U.S. Department of Defense (end customer)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>

            <Field label="Additional notes">
              <textarea {...register("additionalNotes")} rows={3}
                placeholder="Any further technical requirements, quality standards, packaging needs, or context that would help suppliers respond accurately…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </Field>

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Your RFQ details will be shared only with matched, verified suppliers.
                Your end-use declaration is stored as an immutable compliance record and may be provided to
                suppliers as part of their export licence application.
              </p>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? "Submitting…" : "Submit sourcing request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
