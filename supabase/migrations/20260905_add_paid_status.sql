-- Allow payment links to be marked as 'Paid'.
-- The Paystack paymentrequest.success webhook flips an Invoice payment link's
-- status to 'Paid' when its payment request is paid. Donations stay 'Active'
-- (they can be paid multiple times).

alter table public.paymentlinks
  drop constraint if exists paymentlinks_status_check;

alter table public.paymentlinks
  add constraint paymentlinks_status_check check (status in ('Active', 'Inactive', 'Paid'));