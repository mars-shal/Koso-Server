# Koso API Reference

Base URL: `https://koso-server-1.onrender.com`
.

All responses are JSON. Errors return `{ "statusCode": number, "message": string }`.

---

## Clients

### Create client
```
POST /clients
```
**Body:**
```json
{
  "email": "client@example.com",
  "first_name": "Marshall",
  "last_name": "Nwosu",
  "phone": "+2348012345678"
}
```
**Response:** `{ "success": true, "email": "client@example.com" }`

---

### List all clients
```
GET /clients
```
**Response:** `[{ id, email, first_name, last_name, phone, created_at, ... }]`

---

### Get one client
```
GET /clients/:email
```
**Response:** `{ id, email, first_name, last_name, phone, ... }`

---

### Update client
```
PATCH /clients/:email
```
**Body (all fields optional):**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "phone": "+2348099999999"
}
```
**Response:** `{ "success": true, "email": "client@example.com" }`

---

### Delete client
```
DELETE /clients/:email
```
**Response:** `{ "success": true, "email": "client@example.com" }`

---

## Projects

### Create project
```
POST /projects
```
**Body:**
```json
{
  "clientId": "client@example.com",
  "name": "Koso App",
  "description": "Personal operations tool",
  "status": "In progress",
  "agreedAmount": 500000,
  "paidAmount": 250000,
  "startDate": "2025-01-01",
  "endDate": "2025-06-30"
}
```
**Response:** `{ "success": true, "name": "Koso App" }`

---

### List all projects
```
GET /projects
```
**Response:** `[{ id, client_id, name, description, status, agreed_amount, paid_amount, start_date, end_date, ... }]`

---

### Get projects by client
```
GET /projects/client/:clientId
```
**Response:** `[{ id, client_id, name, description, status, ... }]`

---

### Get one project
```
GET /projects/:id
```
**Response:** `{ id, client_id, name, description, status, agreed_amount, paid_amount, start_date, end_date, ... }`

---

### Update project
```
PATCH /projects/:id
```
**Body (all fields optional):**
```json
{
  "status": "Completed",
  "paidAmount": 500000
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete project
```
DELETE /projects/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Meetings

### Create meeting
```
POST /meetings
```
**Body:**
```json
{
  "clientId": "client@example.com",
  "projectId": "optional-project-id",
  "date": "2025-03-15T10:00:00Z",
  "summary": "Discussed project scope and deliverables",
  "duration": "1 hour"
}
```
**Response:** `{ "success": true, "clientId": "client@example.com", "date": "2025-03-15T10:00:00Z" }`

---

### List all meetings
```
GET /meetings
```
**Response:** `[{ id, client_id, project_id, date, summary, duration, ... }]`

---

### Get meetings by client
```
GET /meetings/client/:clientId
```
**Response:** `[{ id, client_id, project_id, date, summary, duration, ... }]`

---

### Get one meeting
```
GET /meetings/:id
```
**Response:** `{ id, client_id, project_id, date, summary, duration, ... }`

---

### Update meeting
```
PATCH /meetings/:id
```
**Body (all fields optional):**
```json
{
  "summary": "Updated summary with more details",
  "duration": "1.5 hours"
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete meeting
```
DELETE /meetings/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Logs

### Create log
```
POST /logs
```
**Body:**
```json
{
  "clientId": "client@example.com",
  "projectId": "optional-project-id",
  "type": "activity",
  "message": "Client approved final design mockup",
  "timestamp": "2025-03-15T14:30:00Z"
}
```
**Response:** `{ "success": true, "clientId": "client@example.com", "type": "activity" }`

---

### List all logs
```
GET /logs
```
**Response:** `[{ id, client_id, project_id, type, message, timestamp, ... }]`

---

### Get logs by client
```
GET /logs/client/:clientId
```
**Response:** `[{ id, client_id, project_id, type, message, timestamp, ... }]`

---

### Get one log
```
GET /logs/:id
```
**Response:** `{ id, client_id, project_id, type, message, timestamp, ... }`

---

### Delete log
```
DELETE /logs/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Documents

### Create document
```
POST /documents
```
**Body:**
```json
{
  "clientId": "client@example.com",
  "projectId": "optional-project-id",
  "name": "NDA - March 2025",
  "type": "NDA",
  "signed": "Pending",
  "fileUrl": "https://drive.google.com/..."
}
```
**`type` values:** `"NDA"` | `"Agreement"` | `"PRD"` | `"Terms"` | `"Receipt"` | `"Other"`
**`signed` values:** `"Signed"` | `"Pending"` | `"N/A"`

**Response:** `{ "success": true, "name": "NDA - March 2025" }`

---

### Upload document file
```
POST /documents/upload
```
Uploads a file to Supabase Storage (default bucket `documents`) and saves the document row with the generated public URL.

**Body:**
```json
{
  "clientId": "client@example.com",
  "projectId": "optional-project-id",
  "name": "NDA - March 2025.pdf",
  "type": "NDA",
  "fileData": "<base64-encoded-file>",
  "contentType": "application/pdf"
}
```
**Optional fields:** `fileName` (storage filename, defaults to `name`), `signed` (`"Signed"` | `"Pending"` | `"N/A"`, defaults `"N/A"`), `bucket` (defaults to `documents`).

**Storage path:** `{clientId}/{sanitized-fileName}` in the bucket.

**Response:**
```json
{
  "success": true,
  "name": "NDA - March 2025.pdf",
  "fileUrl": "https://<project>.supabase.co/storage/v1/object/public/documents/client@example.com/NDA-March-2025.pdf"
}
```

---

### List all documents
```
GET /documents
```
**Filter options:**
```
GET /documents?clientId=client@example.com
GET /documents?projectId=uuid
GET /documents?type=NDA
```
**Response:** `[{ id, client_id, project_id, name, type, signed, file_url, created_at, ... }]`

---

### Get one document
```
GET /documents/:id
```
**Response:** `{ id, client_id, project_id, name, type, signed, file_url, ... }`

---

### Update document
```
PATCH /documents/:id
```
**Body (all fields optional):**
```json
{
  "signed": "Signed",
  "name": "NDA - March 2025 (signed)"
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete document
```
DELETE /documents/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Milestones

### Create milestone
```
POST /milestones
```
**Body:**
```json
{
  "projectId": "project-uuid",
  "name": "Design phase complete",
  "dueDate": "2025-04-01",
  "status": "incomplete",
  "description": "All mockups approved"
}
```
**`status` values:** `"complete"` | `"incomplete"`

**Response:** `{ "success": true, "name": "Design phase complete" }`

---

### List all milestones
```
GET /milestones
```
**Response:** `[{ id, project_id, name, due_date, status, description, ... }]`

---

### Get milestones by project
```
GET /milestones/project/:projectId
```
**Response:** `[{ id, project_id, name, due_date, status, description, ... }]`

---

### Get one milestone
```
GET /milestones/:id
```
**Response:** `{ id, project_id, name, due_date, status, description, ... }`

---

### Update milestone
```
PATCH /milestones/:id
```
**Body (all fields optional):**
```json
{
  "status": "complete",
  "description": "All mockups approved by client on March 28"
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete milestone
```
DELETE /milestones/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Payments (Paystack API)

### Create payment page (donations / one-time)
```
POST /payments/page
```
**Body:**
```json
{
  "name": "Support Koso",
  "amount": 5000,
  "description": "Donate to the project"
}
```
**Response:** `{ "success": true, "slug": "support-koso-abc123" }`

---

### Create payment request (invoice)
```
POST /payments/request
```
**Body:**
```json
{
  "amount": 250000,
  "description": "50% deposit for Koso App",
  "customerId": "paystack-customer-id",
  "dueDate": "2025-04-01",
  "sendNotification": true
}
```
**Response:** `{ "success": true, "data": { ... } }`

---

### Create customer
```
POST /payments/customer
```
**Body:**
```json
{
  "email": "client@example.com",
  "first_name": "Marshall",
  "last_name": "Nwosu",
  "phone": "+2348012345678"
}
```
**Response:** `{ "success": true, "data": { ... } }`

---

### List customers
```
GET /payments/customers
```
**Response:** `{ data: [ { id, email, first_name, last_name, ... } ] }`

---

### List transactions
```
GET /payments/transactions
```
**Response:** `{ data: [ { id, amount, status, reference, ... } ] }`

---

### Get one transaction
```
GET /payments/transactions/:id
```
**Response:** `{ data: { id, amount, status, reference, ... } }`

---

### Paystack webhook
```
POST /payments/webhook
```
Set this as your webhook URL in the [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer) (Settings → API Keys & Webhooks → Webhook URL).

- Verifies the `x-paystack-signature` header (HMAC-SHA512 of the raw body, signed with `PAYSTACK_SECRET_KEY`). Invalid signatures return `401`.
- Responds to `charge.success` → records/sets a `Transactions` row to `Succeeded`, and `charge.failed` → `Failed`. Updates are idempotent by `gateway_ref` (reference), so Paystack retries won't duplicate rows.
- Amounts are converted from kobo/paise to the base unit (`amount / 100`).

**Response (verify succeeded):**
```json
{ "success": true, "reference": "paystack-ref-abc123", "status": "Succeeded" }
```

---

## Payment Links

### Create payment link
```
POST /payment-links
```
**Body:**
```json
{
  "type": "Invoice",
  "linkedClientId": "client@example.com",
  "linkedProjectId": "project-uuid",
  "linkedLabel": "Koso App - 50% Deposit",
  "amount": 250000,
  "currency": "NGN",
  "status": "Active"
}
```
**`type` values:** `"Invoice"` | `"Donation"`
**`status` values:** `"Active"` | `"Inactive"`

`amount` is in **naira** — the server converts to kobo (×100) for Paystack.
`url` is **optional in the body**; the server generates it from Paystack:

- `type: "Donation"` → creates a Paystack **payment page** → `url` = `https://paystack.com/pay/{slug}`. Amount optional (any-amount page when omitted).
- `type: "Invoice"` → creates a Paystack **customer** from the linked client's `email`/`first_name`/`last_name`/`phone` (falls back to `koso+ietorobong@gmail.com` when no client/email exists), then a Paystack **payment request** → `url` = `https://paystack.com/pay/{PRQ_code}`. `amount` is required (400 otherwise).

If the Paystack call fails, the whole request fails — nothing is saved to Supabase.

**Response:** `{ "success": true, "label": "Koso App - 50% Deposit", "url": "https://paystack.com/pay/PRQ_4j23kasdf" }`

---

### List payment links
```
GET /payment-links
```
**Filter options:**
```
GET /payment-links?clientId=client@example.com
GET /payment-links?projectId=uuid
GET /payment-links?type=Donation
```
**Response:** `[{ id, type, linked_client_id, linked_project_id, linked_label, amount, currency, status, url, created_at, ... }]`

---

### Get one payment link
```
GET /payment-links/:id
```
**Response:** `{ id, type, linked_client_id, linked_project_id, linked_label, amount, currency, status, url, ... }`

---

### Update payment link
```
PATCH /payment-links/:id
```
**Body (all fields optional):**
```json
{
  "status": "Inactive"
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete payment link
```
DELETE /payment-links/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## Transactions

### Create transaction
```
POST /transactions
```
**Body:**
```json
{
  "paymentLinkId": "payment-link-uuid",
  "payerName": "Marshall Nwosu",
  "payerEmail": "marshall@example.com",
  "amount": 250000,
  "currency": "NGN",
  "date": "2025-03-15T12:00:00Z",
  "status": "Succeeded",
  "gatewayRef": "paystack-ref-abc123"
}
```
**`status` values:** `"Succeeded"` | `"Pending"` | `"Failed"` | `"Refunded"`

**Response:** `{ "success": true, "gatewayRef": "paystack-ref-abc123" }`

---

### List transactions
```
GET /transactions
```
**Filter options:**
```
GET /transactions?paymentLinkId=uuid
GET /transactions?status=Succeeded
```
**Response:** `[{ id, payment_link_id, payer_name, payer_email, amount, currency, date, status, gateway_ref, ... }]`

---

### Get one transaction
```
GET /transactions/:id
```
**Response:** `{ id, payment_link_id, payer_name, payer_email, amount, currency, date, status, gateway_ref, ... }`

---

### Update transaction
```
PATCH /transactions/:id
```
**Body (all fields optional):**
```json
{
  "status": "Refunded"
}
```
**Response:** `{ "success": true, "id": "uuid" }`

---

### Delete transaction
```
DELETE /transactions/:id
```
**Response:** `{ "success": true, "id": "uuid" }`

---

## AI (Google GenAI)

Generate a Product Requirements Document. Uses the LLM (`@google/genai`, model overridable via `GEMINI_MODEL`, defaults to `gemini-2.0-flash`).

### Generate PRD
```
POST /ai/prd
```
**Body:**
```json
{
  "name": "Koso App",
  "description": "Optional scope for the PRD",
  "projectId": "optional-project-uuid"
}
```
When `projectId` is provided, the project's milestones are fetched and included as context.

**Response:**
```json
{
  "name": "Koso App",
  "prd": "# Koso App — Product Requirements Document ... (markdown)"
}
```

---

### Suggest price (quote)
```
POST /ai/pricing
```
**Body:**
```json
{
  "description": "Full-stack web app with auth, payments, and admin dashboard",
  "clientType": "company",
  "currency": "NGN"
}
```
**Optional fields:** `clientType`, `projectId`, `currency` (default `NGN`).

**Response:**
```json
{
  "currency": "NGN",
  "price_min": 1500000,
  "price_max": 2500000,
  "recommended_price": 2000000,
  "rate_hourly": 25000,
  "explanation": "…",
  "assumptions": ["…"]
}
```

---

## Resume

### Build resume from projects
```
POST /resume
```
Fetches **all** projects from Supabase, asks the LLM to write an ATS-optimized resume (Google XYZ format bullets, standard section headers), then scores it (hybrid: 50% LLM assessment + 50% deterministic ATS heuristic).

**Body:** none

**Response:**
```json
{
  "resume": "# Summary\n... (markdown resume)",
  "score": {
    "score": 82,
    "summary": "Good resume with room for improvement in a few areas.",
    "issues": [{ "category": "content", "severity": "medium", "description": "…" }],
    "suggestions": ["…"]
  },
  "projectCount": 5
}
```

---

### Re-score resume
```
POST /resume/score
```
**Body:**
```json
{
  "resumeText": "# Summary\n... (existing resume markdown)"
}
```
**Response:** same `score` object shape as `POST /resume` (`score`, `summary`, `issues`, `suggestions`).

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Bad request — missing or invalid fields |
| `404` | Not found — resource doesn't exist |
| `500` | Server error — something broke on the backend |

**Error body format:**
```json
{
  "statusCode": 400,
  "message": "Failed to create client",
  "error": "Bad Request"
}
```

---

## Quick Reference: Table Mappings

| Endpoint | Supabase table | Key columns |
|----------|----------------|-------------|
| `/clients` | `Clients` | `email` (unique), `first_name`, `last_name`, `phone` |
| `/projects` | `Projects` | `id`, `client_id`, `name`, `status`, `agreed_amount`, `paid_amount` |
| `/meetings` | `Meetings` | `id`, `client_id`, `project_id`, `date`, `summary`, `duration` |
| `/logs` | `Logs` | `id`, `client_id`, `project_id`, `type`, `message`, `timestamp` |
| `/documents` | `Documents` | `id`, `client_id`, `project_id`, `name`, `type`, `signed`, `file_url` |
| `/milestones` | `Milestones` | `id`, `project_id`, `name`, `due_date`, `status`, `description` |
| `/payment-links` | `PaymentLinks` | `id`, `type`, `linked_client_id`, `linked_project_id`, `linked_label`, `amount`, `url` |
| `/transactions` | `Transactions` | `id`, `payment_link_id`, `payer_name`, `amount`, `status`, `gateway_ref` |
| `/payments/*` | Paystack API | External — not stored in Supabase |
| `/documents/upload` | `Documents` + Supabase Storage | file in bucket `documents` at `{client_id}/{fileName}`, row with `file_url` |
| `/ai/prd` | `Milestones` (optional context) | Google GenAI — generates markdown PRD |
| `/ai/pricing` | — | Google GenAI — returns price range quote |
| `/resume` | `Projects` (source data) | Google GenAI — builds + scores ATS resume |