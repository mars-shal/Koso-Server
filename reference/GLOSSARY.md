# Koso Backend Glossary

_Terms you'll meet working on this server. Use these names consistently._

## Framework & Structure

**NestJS**:
A TypeScript framework for building HTTP servers, organised around modules, controllers, services, and dependency injection.
_Avoid_: "the express thing", "the node framework"

**Module**:
A NestJS unit that groups related controllers and services, declared with `@Module({...})`. Each domain folder in `src/` is one module.
_Avoid_: "folder", "section"

**Controller**:
A NestJS class annotated with `@Controller('path')` that maps URLs to methods. Owns HTTP concerns only — routes, params, body.
_Avoid_: "the handler file"

**Service**:
A NestJS class annotated with `@Injectable()` that does the data work — talking to Supabase or Paystack. Controllers forward to services.
_Avoid_: "the logic file"

**DTO (Data Transfer Object)**:
A TypeScript class describing the expected shape of a request body. Lives in `dto/` per module.
_Avoid_: "the shape", "the validator"

**Dependency Injection (DI)**:
The pattern where a service is passed into a controller's constructor automatically (instead of being created inside it). NestJS resolves it from the module's `providers`.
_Avoid_: "magic"

## Data Layer

**Supabase**:
The Postgres database + client used for the app's relational data storage. Interacted with via `supabase.from('Table').select()/upsert()/delete()`.

**Paystack**:
The Nigerian payment gateway used for payment pages, invoices, customers, and transaction reads. Wrapped in the `PaymentUtility` class.

**Upsert**:
A database operation that inserts a row, or updates it if it already exists (keyed on a primary/unique column). Both `insert` and `update` in the legacy `Database` class use `upsert`.

## Legacy Layer

**`controllers/`**:
The original framework-free controllers — plain classes that wrap the `Database` class. NOT used for HTTP routes by the running server. Effectively legacy.

**`src/`**:
The real NestJS application that `main.ts` boots. This is the live backend.

## NestJS Decorators

**`@Controller('path')`**:
Sets the base URL prefix for all routes in that controller.

**`@Get()` / `@Post()` / `@Patch()` / `@Delete()`**:
Map a controller method to an HTTP verb. Adding a string like `@Get(':id')` adds a sub-path.

**`@Body()`**:
Captures the parsed request body (validated against the DTO).

**`@Param('name')`**:
Captures a value from the URL path variable.

**`@Injectable()`**:
Marks a class as injectable so NestJS's DI container can provide it where needed.

## Errors

**`BadRequestException`**:
A NestJS exception that returns HTTP 400. Used by services when a Supabase/Paystack call fails.

**`NotFoundException`**:
A NestJS exception that returns HTTP 404. Used when a requested resource (by id/email) isn't found.