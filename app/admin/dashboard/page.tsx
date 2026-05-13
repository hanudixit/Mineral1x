import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [suppliers, importers, rfqs] = await Promise.all([
    db.supplier.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.importer.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.rFQ.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        importer: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-teal-700">MineralX Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            View recent supplier applications, importer profiles, and sourcing requests.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Suppliers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {suppliers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Importers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {importers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">RFQs</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {rfqs.length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent suppliers
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">Country</th>
                  <th className="py-3 pr-4">Contact</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {supplier.companyName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {supplier.country}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {supplier.contactEmail}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {supplier.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent importers
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">Country</th>
                  <th className="py-3 pr-4">Contact</th>
                  <th className="py-3 pr-4">Industry</th>
                </tr>
              </thead>
              <tbody>
                {importers.map((importer) => (
                  <tr key={importer.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {importer.companyName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {importer.country}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {importer.contactEmail}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {importer.industryVertical}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent sourcing requests
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Mineral</th>
                  <th className="py-3 pr-4">Volume MT</th>
                  <th className="py-3 pr-4">Importer</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {rfq.mineralType}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {rfq.volumeMt.toString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {rfq.importer.companyName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {rfq.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            ← Back to app
          </Link>
        </div>
      </div>
    </main>
  );
}