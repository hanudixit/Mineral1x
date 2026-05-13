import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { User, UserRole } from "@prisma/client";

// ─── Get the current app User (not just Clerk session) ───────────────────────

export async function getAppUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  return db.user.findUnique({ where: { clerkId } });
}

// ─── Require auth — redirect to sign-in if not logged in ─────────────────────

export async function requireAuth(): Promise<User> {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");
  return user;
}

// ─── Require a specific role ──────────────────────────────────────────────────

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth();
  if (user.role !== role) redirect("/unauthorized");
  return user;
}

export const requireAdmin = () => requireRole("ADMIN");
export const requireSupplier = () => requireRole("SUPPLIER");
export const requireImporter = () => requireRole("IMPORTER");

// ─── Sync Clerk user into the DB on first sign-in ────────────────────────────
// Called from the Clerk webhook handler at /api/webhooks/clerk

export async function syncClerkUser(
  clerkId: string,
  email: string,
  role: UserRole
): Promise<User> {
  return db.user.upsert({
    where: { clerkId },
    create: { clerkId, email, role },
    update: { email }, // keep email in sync if they change it in Clerk
  });
}

// ─── Get supplier profile for the current user ────────────────────────────────

export async function getCurrentSupplier() {
  const user = await requireRole("SUPPLIER");
  const supplier = await db.supplier.findUnique({
    where: { userId: user.id },
    include: {
      minerals: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      certifications: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!supplier) redirect("/supplier/onboarding");
  return supplier;
}

// ─── Get importer profile for the current user ───────────────────────────────

export async function getCurrentImporter() {
  const user = await requireRole("IMPORTER");
  const importer = await db.importer.findUnique({
    where: { userId: user.id },
  });
  if (!importer) redirect("/importer/onboarding");
  return importer;
}
