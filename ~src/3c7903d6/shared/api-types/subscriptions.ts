import { z } from "zod";

export const LookupKey = z.enum(["cohost_plus_monthly"]);

export const CreateCheckoutSessionReq = z.object({
    priceLookupKey: LookupKey,
});
