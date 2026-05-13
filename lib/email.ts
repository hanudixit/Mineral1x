import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "MineralX <noreply@mineralx.io>";

// ─── Supplier: verification submitted ────────────────────────────────────────

export async function sendSupplierSubmittedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your listing is under review — MineralX",
    html: `
      <p>Hi ${companyName} team,</p>
      <p>Thanks for submitting your supplier profile to MineralX. Our team will review your certifications and documents within <strong>2 business days</strong>.</p>
      <p>We'll email you as soon as your listing is approved and visible to importers.</p>
      <p style="color:#666;font-size:13px;">Questions? Reply to this email or contact <a href="mailto:support@mineralx.io">support@mineralx.io</a></p>
    `,
  });
}

// ─── Supplier: approved ───────────────────────────────────────────────────────

export async function sendSupplierApprovedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your listing is live — MineralX",
    html: `
      <p>Hi ${companyName} team,</p>
      <p>Great news — your MineralX supplier listing has been <strong>verified and is now live</strong>.</p>
      <p>Importers across the US, EU, Japan, and Australia can now find and contact you for critical mineral sourcing.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/supplier/dashboard" style="background:#1D9E75;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">View your listing →</a></p>
    `,
  });
}

// ─── Supplier: docs requested ─────────────────────────────────────────────────

export async function sendDocsRequestedEmail(
  to: string,
  companyName: string,
  adminNote: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Action needed: additional documents required — MineralX",
    html: `
      <p>Hi ${companyName} team,</p>
      <p>Our verification team has reviewed your submission and needs a few additional documents before we can approve your listing.</p>
      <blockquote style="border-left:3px solid #ccc;margin-left:0;padding-left:16px;color:#444">${adminNote}</blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/supplier/onboarding">Upload documents →</a></p>
    `,
  });
}

// ─── Match intro: supplier ────────────────────────────────────────────────────

export async function sendMatchIntroToSupplier(params: {
  supplierEmail: string;
  supplierCompany: string;
  importerCompany: string;
  importerContact: string;
  importerEmail: string;
  mineralType: string;
  volumeMt: number;
  deliveryDeadline?: string;
  endUseCategory: string;
  rfqId: string;
  matchId: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.supplierEmail,
    subject: `New sourcing inquiry — ${params.mineralType} (${params.volumeMt} MT)`,
    html: `
      <p>Hi ${params.supplierCompany} team,</p>
      <p>MineralX has matched you with a verified importer looking to source <strong>${params.mineralType}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;margin:16px 0">
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Importer</td><td style="padding:6px 12px">${params.importerCompany}</td></tr>
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Contact</td><td style="padding:6px 12px">${params.importerContact} &lt;${params.importerEmail}&gt;</td></tr>
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Mineral</td><td style="padding:6px 12px">${params.mineralType}</td></tr>
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Volume</td><td style="padding:6px 12px">${params.volumeMt} metric tonnes</td></tr>
        ${params.deliveryDeadline ? `<tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Deadline</td><td style="padding:6px 12px">${params.deliveryDeadline}</td></tr>` : ""}
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">End use</td><td style="padding:6px 12px">${params.endUseCategory}</td></tr>
      </table>
      <p>Reply directly to the importer or use your MineralX deal workspace to respond.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/supplier/deals/${params.matchId}" style="background:#1D9E75;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Open deal workspace →</a></p>
      <p style="color:#888;font-size:12px;">RFQ ID: ${params.rfqId} · Match ID: ${params.matchId}</p>
    `,
  });
}

// ─── Match intro: importer ────────────────────────────────────────────────────

export async function sendMatchIntroToImporter(params: {
  importerEmail: string;
  importerContact: string;
  supplierCompany: string;
  supplierCountry: string;
  supplierContactName: string;
  supplierContactEmail: string;
  mineralType: string;
  matchId: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.importerEmail,
    subject: `Supplier match found — ${params.mineralType} from ${params.supplierCountry}`,
    html: `
      <p>Hi ${params.importerContact},</p>
      <p>We've matched your RFQ with a verified supplier:</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;margin:16px 0">
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Supplier</td><td style="padding:6px 12px">${params.supplierCompany}</td></tr>
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Country</td><td style="padding:6px 12px">${params.supplierCountry}</td></tr>
        <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:500">Contact</td><td style="padding:6px 12px">${params.supplierContactName} &lt;${params.supplierContactEmail}&gt;</td></tr>
      </table>
      <p>The supplier has been notified and will reach out shortly. You can also message them directly from your deal workspace.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/importer/deals/${params.matchId}" style="background:#1D9E75;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Open deal workspace →</a></p>
    `,
  });
}

// ─── Deal closed: both parties ────────────────────────────────────────────────

export async function sendDealClosedEmail(params: {
  to: string;
  contactName: string;
  dealId: string;
  totalValueUsd: number;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: "Deal closed — MineralX",
    html: `
      <p>Hi ${params.contactName},</p>
      <p>Your deal (ID: ${params.dealId}) has been marked as <strong>closed</strong>. Total value: <strong>$${params.totalValueUsd.toLocaleString()}</strong>.</p>
      <p>All compliance documents are stored in your deal workspace for your records.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/deals/${params.dealId}">View deal summary →</a></p>
    `,
  });
}
