export class GeneratePricingDto {
  /** Description of the work / scope to price. */
  description: string;
  /** Client name or type (company / freelance / personal) to tailor the quote. */
  clientType?: string;
  /** Optional project id to consider agreed_amount/history. */
  projectId?: string;
  /** Optional currency hint (default NGN). */
  currency?: string;
}
