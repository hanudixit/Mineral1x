import { db } from "@/lib/db";
import Link from "next/link";

export default async function DirectoryPage() {
  const suppliers = await db.supplier.findMany({
    where: {
      status: "VERIFIED",
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-teal-700">MineralX</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Verified supplier directory
          </h1>
          <p className="mt-2 text-slate-600">
            Browse suppliers that have passed admin review.
          </p>
        </div>

        {suppliers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No verified suppliers yet
            </h2>
            <p className="mt-2 text-slate-600">
              Suppliers will appear here after admin approval.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {supplier.companyName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {supplier.country}
                    </p>
                  </div>

                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    VERIFIED
                  </span>
                </div>

                {supplier.description && (
                  <p className="mt-4 text-sm text-slate-600">
                    {supplier.description}
                  </p>
                )}

                <div className="mt-5 grid gap-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Contact:</span>{" "}
                    {supplier.contactName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Email:</span>{" "}
                    {supplier.contactEmail}
                  </p>
                  {supplier.website && (
                    <p>
                      <span className="font-medium text-slate-900">Website:</span>{" "}
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 hover:text-teal-800"
                      >
                        {supplier.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href="/rfq"
            className="rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            Submit sourcing request
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}