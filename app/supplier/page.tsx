"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Zod schemas for each step ────────────────────────────────────────────────

const companySchema = z.object({
  companyName:        z.string().min(2, "Required"),
  registrationNumber: z.string().optional(),
  country:            z.string().length(2, "Select a country"),
  address:            z.string().min(5, "Required"),
  website:            z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description:        z.string().max(2000).optional(),
  contactName:        z.string().min(2, "Required"),
  contactTitle:       z.string().optional(),
  contactEmail:       z.string().email("Enter a valid email"),
  contactPhone:       z.string().optional(),
});

const mineralSchema = z.object({
  minerals: z.array(z.object({
    mineralType:   z.string().min(1, "Select a mineral"),
    customName:    z.string().optional(),
    purityPercent: z.string().optional(),
    formFactor:    z.string().optional(),
    minOrderMt:    z.string().min(1, "Required"),
    maxOrderMt:    z.string().optional(),
    leadTimeDays:  z.string().optional(),
    portOfExport:  z.string().optional(),
    incoterms:     z.string().optional(),
    mineLocation:  z.string().optional(),
    processingLocation: z.string().optional(),
  })).min(1, "Add at least one mineral"),
});

type CompanyValues = z.infer<typeof companySchema>;
type MineralValues = z.infer<typeof mineralSchema>;

// ─── FORGE member countries ───────────────────────────────────────────────────
const FORGE_COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "ZA", name: "South Africa" },
  { code: "PH", name: "Philippines" },
  { code: "MA", name: "Morocco" },
  { code: "CD", name: "DRC (Congo)" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "PE", name: "Peru" },
  { code: "AR", name: "Argentina" },
  { code: "UA", name: "Ukraine" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "AE", name: "UAE" },
];

const MINERALS = [
  { value: "NDFEB_MAGNET", label: "NdFeB magnets (neodymium-iron-boron)" },
  { value: "NEODYMIUM", label: "Neodymium (Nd)" },
  { value: "PRASEODYMIUM", label: "Praseodymium (Pr)" },
  { value: "DYSPROSIUM", label: "Dysprosium (Dy)" },
  { value: "TERBIUM", label: "Terbium (Tb)" },
  { value: "LANTHANUM", label: "Lanthanum (La)" },
  { value: "COBALT", label: "Cobalt (Co)" },
  { value: "LITHIUM", label: "Lithium (Li)" },
  { value: "GALLIUM", label: "Gallium (Ga)" },
  { value: "GERMANIUM", label: "Germanium (Ge)" },
  { value: "ANTIMONY", label: "Antimony (Sb)" },
  { value: "TUNGSTEN", label: "Tungsten (W)" },
  { value: "GRAPHITE", label: "Graphite" },
  { value: "NICKEL", label: "Nickel (Ni)" },
  { value: "OTHER", label: "Other" },
];

const STEPS = ["Company details", "Minerals", "Documents", "Billing"];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium border
            ${i < current ? "bg-teal-600 border-teal-600 text-white"
              : i === current ? "border-teal-600 text-teal-700"
              : "border-gray-300 text-gray-400"}`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`text-sm hidden sm:block ${i === current ? "text-gray-900 font-medium" : "text-gray-400"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
        </div>
      ))}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Step 1: Company details ──────────────────────────────────────────────────

function CompanyStep({ onNext }: { onNext: (data: CompanyValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Field label="Company name" error={errors.companyName?.message} required>
          <input {...register("companyName")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </Field>
        <Field label="Registration number" error={errors.registrationNumber?.message}>
          <input {...register("registrationNumber")} placeholder="ABN / company reg." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </Field>
      </div>

      <Field label="Country of registration" error={errors.country?.message} required>
        <select {...register("country")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select country…</option>
          {FORGE_COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Only suppliers from FORGE/Pax Silica partner countries are accepted.</p>
      </Field>

      <Field label="Business address" error={errors.address?.message} required>
        <textarea {...register("address")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
      </Field>

      <Field label="Website" error={errors.website?.message}>
        <input {...register("website")} placeholder="https://yourcompany.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </Field>

      <Field label="Company description" error={errors.description?.message}>
        <textarea {...register("description")} rows={3} placeholder="Brief overview of your company, extraction and processing capabilities…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
      </Field>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Primary contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Name" error={errors.contactName?.message} required>
            <input {...register("contactName")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
          <Field label="Title / role">
            <input {...register("contactTitle")} placeholder="e.g. Head of Sales" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
          <Field label="Email" error={errors.contactEmail?.message} required>
            <input {...register("contactEmail")} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
          <Field label="Phone">
            <input {...register("contactPhone")} type="tel" placeholder="+61 …" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
          Continue →
        </button>
      </div>
    </form>
  );
}

// ─── Step 2: Mineral listings ─────────────────────────────────────────────────

function MineralsStep({ onNext, onBack }: { onNext: (data: MineralValues) => void; onBack: () => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<MineralValues>({
    resolver: zodResolver(mineralSchema),
    defaultValues: { minerals: [{}] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "minerals" });

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <p className="text-sm text-gray-600 mb-6">List each mineral or product you can supply. You can add more later from your dashboard.</p>

      {fields.map((field, i) => (
        <div key={field.id} className="border border-gray-200 rounded-xl p-4 mb-4 relative">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Mineral {i + 1}</p>
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(i)}
              className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Field label="Mineral / product" error={errors.minerals?.[i]?.mineralType?.message} required>
              <select {...register(`minerals.${i}.mineralType`)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select…</option>
                {MINERALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Grade / custom name">
              <input {...register(`minerals.${i}.customName`)} placeholder="e.g. NdPr Oxide 99.5%" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Purity (%)">
              <input {...register(`minerals.${i}.purityPercent`)} type="number" step="0.001" min="0" max="100" placeholder="99.500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Form factor">
              <input {...register(`minerals.${i}.formFactor`)} placeholder="oxide / metal / alloy / finished magnet" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Min. order (MT)" error={errors.minerals?.[i]?.minOrderMt?.message} required>
              <input {...register(`minerals.${i}.minOrderMt`)} type="number" step="0.001" min="0" placeholder="5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Max. order (MT)">
              <input {...register(`minerals.${i}.maxOrderMt`)} type="number" step="0.001" min="0" placeholder="500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Typical lead time (days)">
              <input {...register(`minerals.${i}.leadTimeDays`)} type="number" min="0" placeholder="60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Port of export">
              <input {...register(`minerals.${i}.portOfExport`)} placeholder="e.g. Port of Fremantle, AU" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Mine location">
              <input {...register(`minerals.${i}.mineLocation`)} placeholder="e.g. Mount Weld, Western Australia" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
            <Field label="Processing location">
              <input {...register(`minerals.${i}.processingLocation`)} placeholder="e.g. Kalgoorlie, WA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>
          </div>
        </div>
      ))}

      <button type="button"
        onClick={() => append({})}
        className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors mb-6">
        + Add another mineral
      </button>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
          Continue →
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: Documents placeholder (actual upload in separate component) ──────

function DocumentsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-6">
        Upload your certifications. Our team reviews these as part of verification — typically within 2 business days.
      </p>

      {([
        { type: "COUNTRY_OF_ORIGIN", label: "Country-of-origin certificate", required: true, help: "Issued by your national authority certifying the mineral's country of origin" },
        { type: "EXPORT_LICENSE", label: "Export licence", required: true, help: "Government-issued licence authorising mineral exports" },
        { type: "ISO_9001", label: "ISO 9001 (quality management)", required: false, help: "Optional but increases buyer confidence" },
        { type: "CONFLICT_FREE", label: "Conflict-free / OECD due diligence", required: false, help: "OECD guidance on responsible mineral supply chains" },
      ] as const).map(cert => (
        <div key={cert.type} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {cert.label}
                {cert.required && <span className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Required</span>}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{cert.help}</p>
            </div>
            <label className="cursor-pointer bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap ml-4">
              Upload PDF
              <input type="file" accept=".pdf,image/*" className="hidden"
                onChange={(e) => {
                  // In production: call /api/upload-url then PUT to S3
                  console.log("Upload", cert.type, e.target.files?.[0]);
                }} />
            </label>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 mt-4 mb-6">
        Files are stored encrypted on AWS S3. Only MineralX admins and matched importers can access your documents.
      </p>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <button onClick={onNext} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Billing / Stripe ─────────────────────────────────────────────────

function BillingStep({ onSubmit, onBack, isLoading }: {
  onSubmit: () => void; onBack: () => void; isLoading: boolean;
}) {
  return (
    <div>
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-teal-900">Listing fee: $500 / month</p>
        <p className="text-xs text-teal-700 mt-1">
          Your listing is only visible to verified importers while your subscription is active.
          Cancel anytime. A 1.5% success fee applies on closed deals.
        </p>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">What you get</p>
        {[
          "Verified badge displayed on your listing",
          "Matched to RFQs from vetted US, EU, and allied importers",
          "Deal workspace with document vault and audit trail",
          "Compliance document storage (CoO, end-use certs)",
          "Priority placement in search results",
        ].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="text-teal-600 font-bold text-base">✓</span>
            {f}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-6">
        By clicking "Submit application" you agree to MineralX's{" "}
        <a href="/terms" className="text-teal-600 underline">Terms of Service</a> and{" "}
        <a href="/privacy" className="text-teal-600 underline">Privacy Policy</a>.
        Payment will be collected after your listing is approved.
      </p>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isLoading ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyData, setCompanyData] = useState<CompanyValues | null>(null);
  const [mineralData, setMineralData] = useState<MineralValues | null>(null);

  const handleFinalSubmit = async () => {
    if (!companyData || !mineralData) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create supplier profile
      const supplierRes = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      });
      if (!supplierRes.ok) throw new Error("Supplier profile already exists. Your application is already submitted.");
      const { supplier } = await supplierRes.json();

      // 2. Create mineral listings
      for (const mineral of mineralData.minerals) {
        await fetch("/api/suppliers/minerals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplierId: supplier.id, ...mineral }),
        });
      }

      // 3. Redirect to billing / Stripe setup
      router.push("/supplier/billing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Supplier application</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join MineralX to connect with verified importers across the US, EU, Japan, and Australia.
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && (
            <CompanyStep onNext={(data) => { setCompanyData(data); setStep(1); }} />
          )}
          {step === 1 && (
            <MineralsStep
              onNext={(data) => { setMineralData(data); setStep(2); }}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <DocumentsStep
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <BillingStep
              onSubmit={handleFinalSubmit}
              onBack={() => setStep(2)}
              isLoading={isLoading}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          MineralX — critical minerals marketplace for FORGE and Pax Silica partner countries
        </p>
      </div>
    </div>
  );
}
