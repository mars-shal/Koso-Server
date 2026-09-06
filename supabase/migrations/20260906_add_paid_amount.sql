-- Track how much has actually been paid toward a payment link.
-- paid_amount accumulates from Succeeded transactions:
--   * manual mark-paid via POST /transactions (status='Succeeded'),
--   * the Paystack charge.success webhook when metadata.paymentLinkId is present,
--   * the Paystack paymentrequest.success webhook (invoice fully paid).
-- Invoice links flip to 'Paid'; Donation links stay 'Active' (paid multiple times).

alter table public.paymentlinks
  add column if not exists paid_amount numeric not null default 0;