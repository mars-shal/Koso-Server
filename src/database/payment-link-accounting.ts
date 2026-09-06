import { supabase } from './supabase.js';

export interface PaymentLinkAccountingResult {
  matched: boolean;
  updated: boolean;
  paidAmount?: number;
  status?: string;
  reason?: string;
}

/**
 * Apply a successful payment to a payment link:
 * - bumps accumulated `paid_amount`,
 * - flips Invoice-type links to 'Paid' (Donation links stay 'Active' — paid multiple times).
 *
 * Gracefully degrades when the `paid_amount` column has not been migrated yet
 * (falls back to a status-only flip, mirroring the `paymentlinks_status_check`
 * guard in the webhook handler).
 */
export async function applySuccessfulPayment(
  paymentLinkId: string | undefined,
  amount: number,
): Promise<PaymentLinkAccountingResult> {
  if (!paymentLinkId) {
    return { matched: false, updated: false, reason: 'missing paymentLinkId' };
  }

  const { data: link, error: findError } = await supabase
    .from('paymentlinks')
    .select('id, type, status, paid_amount')
    .eq('id', paymentLinkId)
    .maybeSingle();

  if (findError) {
    const isMissingColumn =
      String(findError.message).includes('paid_amount') ||
      String(findError.message).includes('PGRST204') ||
      String(findError.message).includes('schema cache');
    if (!isMissingColumn) throw findError;

    const { data: basic, error: basicError } = await supabase
      .from('paymentlinks')
      .select('id, type, status')
      .eq('id', paymentLinkId)
      .maybeSingle();
    if (basicError) throw basicError;
    if (!basic) return { matched: false, updated: false, reason: 'payment link not found' };

    const nextStatus = basic.type === 'Invoice' ? 'Paid' : basic.status;
    const { error: flipError } = await supabase
      .from('paymentlinks')
      .update({ status: nextStatus })
      .eq('id', basic.id);
    if (flipError) throw flipError;

    return { matched: true, updated: true, status: nextStatus, reason: 'paid_amount column not migrated' };
  }

  if (!link) {
    return { matched: false, updated: false, reason: 'payment link not found' };
  }

  const paidAmount = Math.round(((link.paid_amount ?? 0) + amount) * 100) / 100;
  const nextStatus = link.type === 'Invoice' ? 'Paid' : link.status;

  const { error: updateError } = await supabase
    .from('paymentlinks')
    .update({ paid_amount: paidAmount, status: nextStatus })
    .eq('id', link.id);

  if (updateError) {
    const isMissingColumn =
      String(updateError.message).includes('paid_amount') ||
      String(updateError.message).includes('PGRST204') ||
      String(updateError.message).includes('schema cache');
    if (!isMissingColumn) throw updateError;
    return { matched: true, updated: false, reason: 'paid_amount column not migrated' };
  }

  return { matched: true, updated: true, paidAmount, status: nextStatus };
}