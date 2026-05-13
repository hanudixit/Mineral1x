import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createRFQSchema = z.object({
  mineralType: z.string(),
  purityPercent: z.number().optional(),
  formFactor: z.string().optional(),
  volumeMt: z.number(),
  targetPriceUsdPerKg: z.number().optional(),
  deliveryDeadline: z.string().optional(),
  deliveryLocation: z.string().optional(),
  endUseDeclaration: z.string().min(10),
  endUseCategory: z.string(),
  ultimateEndUser: z.string().optional(),
  preferredCountries: z.array(z.string()).optional(),
  excludedCountries: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
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
  const parsed = createRFQSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
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

  let importer = await db.importer.findUnique({
    where: { userId: user.id },
  });

  if (!importer) {
    importer = await db.importer.create({
      data: {
        companyName: "Pending importer profile",
        country: "US",
        address: "Pending",
        contactName: email,
        contactEmail: email,
        industryVertical: "OTHER",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  const data = parsed.data;

  const rfq = await db.rFQ.create({
    data: {
      importerId: importer.id,
      mineralType: data.mineralType as any,
      purityPercent: data.purityPercent,
      formFactor: data.formFactor || null,
      volumeMt: data.volumeMt,
      targetPriceUsdPerKg: data.targetPriceUsdPerKg,
      deliveryDeadline: data.deliveryDeadline ? new Date(data.deliveryDeadline) : null,
      deliveryLocation: data.deliveryLocation || null,
      endUseDeclaration: data.endUseDeclaration,
      endUseCategory: data.endUseCategory as any,
      ultimateEndUser: data.ultimateEndUser || null,
      preferredCountries: data.preferredCountries || [],
      excludedCountries: data.excludedCountries || [],
      additionalNotes: data.additionalNotes || null,
    },
  });

  return NextResponse.json({ rfq }, { status: 201 });
}