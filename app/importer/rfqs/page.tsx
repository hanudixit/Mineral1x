import Link from "next/link";

export default function ImporterRFQsPage({
  searchParams,
}: {
  searchParams: { submitted?: string };
}) {
  const submitted = searchParams.submitted === "1";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        {submitted && (
          <div className="rounded-full bg-teal-100 text-teal-700 w-12 h-12 flex items-center justify-center text-xl font-bold">
            ✓
          </div>
        )}

        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          {submitted ? "Sourcing request submitted" : "Your sourcing requests"}
        </h1>

        <p className="mt-3 text-slate-600">
          {submitted
            ? "Your RFQ has been saved. MineralX will use this area to track supplier matches and quotes."
            : "This area will show your submitted RFQs, supplier matches, and quote status."}
        </p>

        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-semibold">Next step</p>
          <p className="mt-1">
            The admin workflow will later match this sourcing request with verified suppliers.
          </p>
        </div>

        <Link
          href="/rfq"
          className="mt-8 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Submit another request
        </Link>
      </div>
    </main>
  );
}