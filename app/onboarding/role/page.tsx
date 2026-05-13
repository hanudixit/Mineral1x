import Link from "next/link";

export default function RolePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          What do you want to do on MineralX?
        </h1>

        <p className="mt-3 text-slate-600">
          Choose the path that best matches your company. You can change this later as we build the full onboarding flow.
        </p>

        <div className="mt-8 grid gap-4">
          <Link
            href="/supplier"
            className="block rounded-xl border border-teal-200 bg-teal-50 p-5 hover:bg-teal-100"
          >
            <h2 className="font-semibold text-teal-900">I am a supplier</h2>
            <p className="mt-1 text-sm text-teal-800">
              List minerals, upload documents, and apply for verification.
            </p>
          </Link>

          <Link
            href="/"
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
          >
            <h2 className="font-semibold text-slate-900">I am an importer</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create an importer profile and source critical minerals.
            </p>
          </Link>

          <Link
            href="/rfq"
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
          >
            <h2 className="font-semibold text-slate-900">Submit a sourcing request</h2>
            <p className="mt-1 text-sm text-slate-600">
              Start with an RFQ if you already know what mineral you need.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}