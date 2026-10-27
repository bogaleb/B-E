import "server-only";
import { Resend } from "resend";
import { publicEnv } from "@/lib/env";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function client() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM = () => process.env.RESEND_FROM_EMAIL || "ETHIO Foods <onboarding@resend.dev>";
const ADMIN = () => (process.env.ADMIN_NOTIFICATION_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#FAF5E9;font-family:Arial,Helvetica,sans-serif;color:#14261D">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E6DEC9;border-radius:14px;overflow:hidden">
  <tr><td style="background:#103F2D;padding:18px 24px;color:#C9A34A;font-size:18px;font-weight:bold">ETHIO Foods</td></tr>
  <tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:22px;color:#103F2D">${esc(title)}</h1>${body}</td></tr>
  <tr><td style="padding:16px 24px;border-top:1px solid #E6DEC9;font-size:12px;color:#56665C">B&amp;E Wholesale LLC · Sterling, Virginia</td></tr>
  </table></td></tr></table></body></html>`;
}

function rows(items: { label: string; value: string }[]) {
  return `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">${items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#56665C">${esc(i.label)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${esc(i.value)}</td></tr>`)
    .join("")}</table>`;
}

export interface MailPayload {
  kind: "Order request" | "Wholesale inquiry" | "Contact message";
  reference?: string;
  customerName: string;
  customerEmail: string;
  details: { label: string; value: string }[];
  items?: { label: string; value: string }[];
}

/** Sends the admin notification and the customer acknowledgment. Never throws. */
export async function sendSubmissionEmails(p: MailPayload): Promise<{ admin: boolean; customer: boolean }> {
  const resend = client();
  if (!resend) {
    console.info(`[email] RESEND_API_KEY not set — skipped emails for ${p.kind} ${p.reference ?? ""}`);
    return { admin: false, customer: false };
  }
  const result = { admin: false, customer: false };
  const adminTo = ADMIN();
  const subjectRef = p.reference ? ` ${p.reference}` : "";
  if (adminTo.length) {
    const { error } = await resend.emails.send({
      from: FROM(), to: adminTo, replyTo: p.customerEmail,
      subject: `New ${p.kind.toLowerCase()}${subjectRef} from ${p.customerName}`.slice(0, 180),
      html: layout(`New ${p.kind.toLowerCase()}`, `${p.reference ? `<p style="font-size:15px">Reference <b>${esc(p.reference)}</b></p>` : ""}${rows(p.details)}${p.items?.length ? `<h2 style="font-size:16px;margin:20px 0 6px">Products</h2>${rows(p.items)}` : ""}<p style="margin-top:20px"><a href="${esc(publicEnv.siteUrl)}/admin" style="color:#176B42">Open the admin dashboard</a></p>`),
    });
    result.admin = !error;
    if (error) console.error("[email] admin notification failed", error.message);
  }
  {
    const ack = p.kind === "Contact message"
      ? `<p style="font-size:15px;line-height:1.6">Thanks for your message, ${esc(p.customerName.split(" ")[0])}. Our team will reply soon.</p>`
      : `<p style="font-size:15px;line-height:1.6">Thanks, ${esc(p.customerName.split(" ")[0])}. We received your ${esc(p.kind.toLowerCase())}. Your reference number is <b>${esc(p.reference)}</b>.</p>
         <p style="font-size:15px;line-height:1.6"><b>This is not a confirmed order or price.</b> We'll contact you to confirm availability, price and delivery.</p>${p.items?.length ? rows(p.items) : ""}`;
    const { error } = await resend.emails.send({
      from: FROM(), to: [p.customerEmail],
      subject: p.reference ? `We received your request ${p.reference}` : "We received your message",
      html: layout(p.kind === "Contact message" ? "Message received" : "Request received", ack),
    });
    result.customer = !error;
    if (error) console.error("[email] acknowledgment failed", error.message);
  }
  return result;
}
