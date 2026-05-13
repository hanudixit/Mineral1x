import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const allowedAdmins = ["hanudixit.2017@gmail.com"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  if (!email || !allowedAdmins.includes(email)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json();
  const status = body.status;

  if (!["PENDING_REVIEW", "DOCS_REQUESTED", "VERIFIED", "SUSPENDED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid supplier status." }, { status: 400 });
  }

  const supplier = await db.supplier.update({
    where: { id: params.id },
    data: {
      status,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
    },
  });

  return NextResponse.json({ supplier });
}