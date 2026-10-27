import { formEndpoint } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { submitContact } from "@/lib/submissions";

export const runtime = "nodejs";
export const POST = formEndpoint({ name: "contact", schema: contactSchema, limit: { max: 5, windowSec: 600 }, handle: submitContact });
