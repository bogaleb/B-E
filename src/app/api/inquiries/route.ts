import { formEndpoint } from "@/lib/api";
import { inquirySchema } from "@/lib/validation";
import { submitInquiry } from "@/lib/submissions";

export const runtime = "nodejs";
export const POST = formEndpoint({ name: "inquiry", schema: inquirySchema, limit: { max: 5, windowSec: 600 }, handle: submitInquiry });
