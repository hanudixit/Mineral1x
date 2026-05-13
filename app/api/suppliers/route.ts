import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth";
import { sendSupplierSubmittedEmail } from "@/lib/email";
import { z } from "zod";
import type { MineralType, CertificationType } from "@prisma/client";

// ─── GET /api/suppliers ───────────────────────────────────────────────────────
// Public directory — returns verified, active suppliers with optional filters.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mineral   = searchParams.get("mineral") as MineralType | null;
  const country   = searchParams.get("country");
  const certType  = searchParams.get("cert") as CertificationType | null;
  const page      = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize  = 20;

  const where = {
    status: "VERIFIED" as const,
    listingFeeActive: true,
    ...(country && { country }),
    ...(mineral && {
      minerals: { some: { mineralType: mineral, isActive: true } },
    }),
    ...(certType && {
      certifications: { some: { certType, verifiedByAdmin: true } },
    }),
  };

  const [suppliers, total] = await Promise.all([
    db.supplier.findMany({
      where,
      include: {
        minerals: { where: { isActive: true }, orderBy: { mineralType: "asc" } },
        certifications: { where: { verifiedByAdmin: true } },
      },
      orderBy: { verifiedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.supplier.count({ where }),
  ]);

  // Strip internal fields before returning
  const safe = suppliers.map(({ internalNotes, stripeCustomerId, stripeSubId, ...s }) => s);

  return NextResponse.json({ suppliers: safe, total, page, pageSize });
}

// ─── POST /api/suppliers ──────────────────────────────────────────────────────
// Create a new supplier profile. Called after the user registers as SUPPLIER.

const createSupplierSchema = z.object({
  companyName:          z.string().min(2).max(200),
  registrationNumber:   z.string().optional(),
  country:              z.string().length(2), // ISO alpha-2
  address:              z.string().min(5),
  website:              z.string().url().optional().or(z.literal("")),
  description:          z.string().max(2000).optional(),
  contactName:          z.string().min(2),
  contactTitle:         z.string().optional(),
  contactEmail:         z.string().email(),
  contactPhone:         z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

if (!clerkId) {
  return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
}

const clerkUser = await currentUser();
const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

if (!email) {
  return NextResponse.json({ error: "No email found for signed-in user." }, { status: 400 });
}

const user = await db.user.upsert({
  where: { clerkId },
  update: {
    email,
    role: "SUPPLIER",
  },
  create: {
    clerkId,
    email,
    role: "SUPPLIER",
  },
});
  const body = await req.json();
  const parsed = createSupplierSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // Check if supplier profile already exists
  const existing = await db.supplier.findUnique({ where: { userId: user.id } });
 if (existing) {
  return NextResponse.json({ error: "Supplier profile already exists" }, { status: 409 });
}

const data = parsed.data as {
  companyName: string;
  registrationNumber?: string;
  country: string;
  address: string;
  website?: string;
  description?: string;
  contactName: string;
  contactTitle?: string;
  contactEmail: string;
  contactPhone?: string;
};

const supplier = await db.supplier.create({
  data: {
    companyName: data.companyName,
    registrationNumber: data.registrationNumber || null,
    country: data.country,
    address: data.address,
    website: data.website || null,
    description: data.description || null,
    contactName: data.contactName,
    contactTitle: data.contactTitle || null,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone || null,
    user: {
      connect: {
        id: user.id,
      },
    },
  },
});

  // Notify admin via email
  await sendSupplierSubmittedEmail(parsed.data.contactEmail, parsed.data.companyName);

  return NextResponse.json({ supplier }, { status: 201 });
}
