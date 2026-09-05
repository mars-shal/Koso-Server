# Koso Backend Resources

## Knowledge

- [Official NestJS Docs: Controllers](https://docs.nestjs.com/controllers)
  The canonical reference for how route decorators (`@Get`, `@Post`, `@Param`, `@Body`) map to endpoints. Use for: understanding any controller in Koso.
- [Official NestJS Docs: Modules](https://docs.nestjs.com/modules)
  Explains what a `@Module()` is and how controllers + providers get wired together. Use for: understanding why `app.module.ts` lists every module.
- [Official Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/select)
  The exact API used in the services (`from('Table').select().eq().upsert().delete()`). Use for: any Supabase query in Koso.
- [NestJS Providers & Dependency Injection](https://docs.nestjs.com/providers)
  Covers the `@Injectable()` + constructor-injection pattern used in every Koso service. Use for: understanding why controllers receive a service in their constructor.

## Wisdom (Communities)

- [NestJS Discord](https://discord.gg/nestjs)
  The official community — high signal for Nest-specific patterns. Use for: when a decorator misbehaves or an async/DI pattern is unclear.
- [r/NestJS](https://reddit.com/r/NestJS)
  Reasonable moderation, practical advice. Use for: real-world "how would you structure this" questions.

_Note: User preferences on community participation not yet established — revisit in a later session._