# Koso Backend — Complete Walkthrough

_A readable, top-to-bottom explanation of how the server is built. Read this alongside the code._

---

## 1. What this server is

Koso's backend is a **NestJS** application that:

- **Serves HTTP endpoints** the frontend (Vue + shadcn-vue) calls.
- **Talks to Supabase** (the database) for storing clients, projects, meetings, documents, milestones, payment links, and transactions.
- **Talks to Paystack** (via the `PaymentUtility` class) for creating payment pages, invoices, customers, and reading transactions.

---

## 2. The two code layers

The project has **two folders** that both hold "controllers." This was not a plan — it's history.

### `controllers/` — the original, framework-free layer

- Plain TypeScript classes. **No NestJS decorators.**
- Each class holds a private `Database` instance (from `model/database.ts`).
- Methods like `createClient`, `getAllProjects` call the `Database` class.
- **These do NOT serve HTTP routes.** There's no router. You'd have to call the methods directly from code.
- This layer is effectively **legacy** — it compiled and exists, but the live server doesn't route through it.

### `src/` — the real NestJS application

- Uses NestJS decorators (`@Controller`, `@Get`, `@Injectable`, `@Body`, `@Param`).
- Structured into **modules**. Each module = a domain (clients, projects, etc.).
- Each module has 3-4 files:
  - `<name>.controller.ts` — the HTTP routes
  - `<name>.service.ts` — the data access logic
  - `<name>.module.ts` — NestJS wiring
  - `dto/` — request body types

**`src/` is what `main.ts` boots. `controllers/` is not loaded by the running server.**

---

## 3. The start of everything: `src/main.ts`

```ts
const app = await NestFactory.create(AppModule);
await app.listen(process.env.PORT ?? 3149);
```

- Creates the Nest application from the root `AppModule`.
- Listens on port `3149` by default (overridable via the `PORT` env var).
- `ObserveInstrument` is NestJS Observe telemetry — you can ignore it unless you care about monitoring.

---

## 4. The wiring map: `src/app.module.ts`

`@Module({ imports: [...], controllers: [...], providers: [...] })` is NestJS's way of declaring "here is everything that exists."

- **imports** — other modules this app should load. Koso imports 9 feature modules.
- **controllers** — HTTP route handlers registered at this level.
- **providers** — services available for injection.

**Rule of thumb:** if you add a new module, you MUST add it to `imports` here, or its routes never mount.

---

## 5. Anatomy of one module: `src/clients/`

### The controller — owns HTTP

```ts
@Controller('clients')            // base path: /clients
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()                          // POST /clients
  create(@Body() dto: CreateClientDto) { return this.clientsService.create(dto); }

  @Get()                           // GET /clients
  findAll() { return this.clientsService.findAll(); }

  @Get(':email')                   // GET /clients/:email
  findOne(@Param('email') email: string) { return this.clientsService.findOne(email); }
}
```

- `@Controller('clients')` sets the URL prefix.
- `@Get()` / `@Post()` / etc. map a method to an HTTP verb.
- `@Body()` captures the request body (validated against the DTO).
- `@Param('email')` captures a path variable.
- **The controller does NO data work.** It just forwards to the service.

### The service — owns data access

```ts
@Injectable()
export class ClientsService {
  async findAll() {
    const { data, error } = await supabase.from('Clients').select();
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }
}
```

- `@Injectable()` makes the class injectable.
- It imports `supabase` from `../database/supabase.js`.
- It throws NestJS exceptions (`BadRequestException`, `NotFoundException`) so failures become clean HTTP errors.

### The DTO — describes the body

```ts
export class CreateClientDto {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}
```

- Describes the exact shape of data the endpoint expects.
- Keeps service function signatures readable and documents the API.

### The module — wires controller + service

```ts
@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
```

---

## 6. One route, end to end: `POST /clients`

1. Request arrives.
2. NestJS sees `@Controller('clients')` + `@Post()` → matches `create()`.
3. `@Body()` parses the JSON into a `CreateClientDto`.
4. Controller calls `this.clientsService.create(dto)`.
5. Service calls `supabase.from('Clients').upsert({...})`.
6. If no error, returns `{ success: true, email }`.
7. NestJS serializes that return value to JSON.

---

## 7. The modules and what they cover

| Module | Base URL | Database table | Purpose |
|--------|----------|----------------|---------|
| `clients/` | `/clients` | `Clients` | Client CRUD |
| `projects/` | `/projects` | `Projects` | Project CRUD + by clientId |
| `meetings/` | `/meetings` | `Meetings` | Meeting logs + by clientId |
| `logs/` | `/logs` | `Logs` | Activity logs |
| `payments/` | `/payments` | Paystack API | Payment pages, invoices, customers, transactions |
| `documents/` | `/documents` | `Documents` | Doc vault, filter by client/project/type |
| `milestones/` | `/milestones` | `Milestones` | Milestones + by projectId |
| `payment-links/` | `/payment-links` | `PaymentLinks` | Invoices + donations, filter by client/project/type |
| `transactions/` | `/transactions` | `Transactions` | Payment transaction records |

`payments/` is special: instead of a Supabase table, it wraps the `PaymentUtility` class that calls the **Paystack API** via axios.

---

## 8. The `Database` class (`model/database.ts`)

The legacy layer's data access. Wraps Supabase in three methods:

```ts
async insert({ table, data })  → supabase.from(table).upsert(data)
async delete({ table, data })  → supabase.from(table).delete().eq('email', data?.email)
async read({ table })          → supabase.from(table).select()
```

Three caveats worth knowing:

- `delete()` is **hard-coded to delete by `email`** — so `deleteProject`/`deleteMilestone` passing `id` won't actually work against this class. This is a real limitation of the legacy layer (the NestJS services don't have this problem — they call Supabase directly with the right `eq` column).
- `insert()` and `update()` both call `upsert` internally — so "update" is really an upsert.
- The methods are `async` and return the Supabase result. If an error occurs, it's logged (not thrown) — so the caller may get `undefined` rather than an error. This is fragile compared to the NestJS services.

---

## 9. The `PaymentUtility` (`utils/paymentUtility.ts` / `src/database/payment-utility.ts`)

A class that wraps Paystack REST calls via axios.

- `paymentPage()` → creates a donation/one-time payment page.
- `paymentRequests()` → creates an invoice payment request.
- `createCustomer()` / `listCustomers()` → manage Paystack customers.
- `getTransactions()` / `fetchTransaction()` → read transactions.

It uses `process.env.PAYSTACK_SECRET_KEY` for auth. Note: the base URL points at `/transaction/`, so paths like `paymentrequest` and `customer` are appended onto `.../transaction/` — a quirk inherited from the original code. It works for the current endpoints but is worth knowing about if you extend it.

---

## 10. Configuration and env vars

The database and payment clients rely on environment variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `PORT` (default 3149)

These live in `.env` (which is gitignored — never commit real secrets).

---

## 11. Build & run

```bash
bun install           # install deps
bun run build         # compiles TS → ./dist (nest build)
bun run start         # run in production mode
bun run start:dev     # run in watch mode
```

`npm run build` runs `nest build` and compiled cleanly — that's how we verified everything above.