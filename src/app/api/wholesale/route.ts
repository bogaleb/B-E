import { formEndpoint } from "@/lib/api";
import { wholesaleSchema } from "@/lib/validation";
import { submitWholesale } from "@/lib/submissions";

export const runtime = "nodejs";
export const POST = formEndpoint({ name: "wholesale", schema: wholesaleSchema, limit: { max: 5, windowSec: 600 }, handle: submitWholesale });
