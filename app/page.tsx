"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  companyName:        z.string().min(2, "Required"),
  registrationNumber: z.string().optional(),
  country:            z.string().length(2, "Select a country"),
  address:            z.string().min(5, "Required"),
  website:            z.string().url("Enter a valid URL").optional().or(z.literal("")),
  contactName:        z.string().min(2, "Required"),
  contactTitle:       z.string().optional(),
  contactEmail:       z.string().email("Enter a valid email"),
  contactPhone:       z.string().optional(),
  industryVertical:   z.string().min(1, "Select your industry"),
  naicsCode:          z.string().optional(),
  annualSpendUsd:     z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" },
  { code: "JP", name: "Japan" }, { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" }, { code: "CA", name: "Canada" },
  { code: "NL", name: "Netherlands" }, { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }, { code: "FI", name: "Finland" },
  { code: "IT", name: "Italy" }, { code: "ES", name: "Spain" },
  { code: "SG", name: "Singapore" }, { code: "IL", name: "Israel" },
  { code: "IN", name: "India" }, { code: "TW", name: "Taiwan" },
];

const VERTICALS = [
  { value: "DEFENSE_AEROSPACE", label: "Defense / Aerospace" },
  { value: "EV_BATTERY", label: "Electric vehicles / Battery manufacturing" },
  { value: "SEMICONDUCTOR", label: "Semiconductor / Electronics" },
  { value: "WIND_ENERGY", label: "Wind energy / Clean power" },
  { value: "CONSUMER_ELECTRONICS", label: "Consumer electronics" },
  { value: "MEDICAL_DEVICES", label: "Medical devices" },
  { value: "INDUSTRIAL_MANUFACTURING", label: "Industrial manufacturing" },
  { value: "OTHER", label: "Other" },
];

const SPEND_BANDS = [
  { value: "<100k", label: "Under $100K / year" },
  { value: "100k-1m", label: "$100K – $1M / year" },
  { value: "1m-10m", label: "$1M – $10M / year" },
  { value: ">10m", label: "Over $10M / year" },
];

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

export default function ImporterOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/importers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong");
      }
      router.push("/importer/directory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">MineralX navigation</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Importer profile
            </a>
            <a
              href="/supplier"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Supplier application
            </a>
            <a
              href="/rfq"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Submit RFQ
            </a>
            <a
              href="/directory"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Verified directory
            </a>
          </div>
        </div>
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-teal-700">How MineralX works</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">1. Suppliers apply</p>
              <p className="mt-1 text-sm text-slate-600">
                Mineral suppliers submit company details, mineral availability, and compliance documents.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">2. Admin verifies</p>
              <p className="mt-1 text-sm text-slate-600">
                MineralX reviews supplier applications before listing them in the verified directory.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">3. Importers submit RFQs</p>
              <p className="mt-1 text-sm text-slate-600">
                Importers create profiles and submit sourcing requests for critical minerals.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create importer account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access verified non-China critical mineral suppliers across FORGE partner countries.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Company */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Company details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="Company name" error={errors.companyName?.message} required>
                <input {...register("companyName")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Registration number">
                <input {...register("registrationNumber")} placeholder="EIN / company reg." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
            </div>

            <Field label="Country" error={errors.country?.message} required>
              <select {...register("country")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Business address" error={errors.address?.message} required>
              <textarea {...register("address")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </Field>

            <Field label="Website">
              <input {...register("website")} placeholder="https://" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </Field>

            {/* Industry */}
            <div className="border-t border-gray-100 pt-4 mt-2 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Industry</p>
            </div>

            <Field label="Industry vertical" error={errors.industryVertical?.message} required
              hint="This helps us match you with the most relevant suppliers.">
              <select {...register("industryVertical")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select industry…</option>
                {VERTICALS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="NAICS code"
                hint="e.g. 334413 for semiconductor manufacturing">
                <input {...register("naicsCode")} placeholder="6-digit code" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Annual critical mineral spend">
                <select {...register("annualSpendUsd")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Prefer not to say</option>
                  {SPEND_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-100 pt-4 mt-2 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Primary contact</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Field label="Name" error={errors.contactName?.message} required>
                <input {...register("contactName")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Title / role">
                <input {...register("contactTitle")} placeholder="e.g. VP Supply Chain" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Email" error={errors.contactEmail?.message} required>
                <input {...register("contactEmail")} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
              <Field label="Phone">
                <input {...register("contactPhone")} type="tel" placeholder="+1 …" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </Field>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 mt-2">
              <p className="text-xs text-gray-500">
                By creating an account you agree to MineralX's{" "}
                <a href="/terms" className="text-teal-600 underline">Terms of Service</a>.
                Your company details are only shared with suppliers you are matched with.
                All access to supplier contact details requires a verified importer account.
              </p>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? "Creating account…" : "Create importer account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
