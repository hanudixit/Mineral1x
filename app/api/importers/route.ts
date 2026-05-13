import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createImporterSchema = z.object({
  companyName: z.string().min(2).max(200),
  registrationNumber: z.string().optional(),
  country: z.string().length(2),
  address: z.string().min(5),
  website: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(2),
  contactTitle: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  industryVertical: z.string(),
  naicsCode: z.string().optional(),
  annualSpendUsd: z.string().optional(),
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

  const body = await req.json();
  const parsed = createImporterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await db.importer.findUnique({ where: { userId: clerkId } });

  if (existing) {
    return NextResponse.json(
      { error: "Importer profile already exists. Your profile is already submitted." },
      { status: 409 }
    );
  }

  const user = await db.user.upsert({
    where: { clerkId },
    update: {
      email,
      role: "IMPORTER",
    },
    create: {
      clerkId,
      email,
      role: "IMPORTER",
    },
  });

  const data = parsed.data;

  const importer = await db.importer.create({
    data: {
      companyName: data.companyName,
      registrationNumber: data.registrationNumber || null,
      country: data.country,
      address: data.address,
      website: data.website || null,
      contactName: data.contactName,
      contactTitle: data.contactTitle || null,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || null,
      industryVertical: data.industryVertical as any,
      naicsCode: data.naicsCode || null,
      annualSpendUsd: data.annualSpendUsd || null,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return NextResponse.json({ importer }, { status: 201 });
}