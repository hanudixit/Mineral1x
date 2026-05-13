import Link from "next/link";

export default function ImporterDirectoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        <div className="rounded-full bg-teal-100 text-teal-700 w-12 h-12 flex items-center justify-center text-xl font-bold">
          ✓
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Importer profile submitted
        </h1>

        <p className="mt-3 text-slate-600">
          Your importer profile has been created. The supplier directory will be added next.
        </p>

        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-semibold">Next step</p>
          <p className="mt-1">
            MineralX will use this area to show verified suppliers, mineral listings, and sourcing matches.
          </p>
        </div>

        <Link
          href="/rfq"
          className="mt-8 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Submit sourcing request
        </Link>
      </div>
    </main>
  );
}