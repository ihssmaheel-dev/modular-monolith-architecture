import { Server, Cpu, Shield, Database, Package } from "lucide-react";
export interface LayerItem {
  id: string;
  label: string;
  icon: typeof Server;
  badge: string;
  path: string;
  description: string;
  responsibilities: string[];
  codeSnippet: string;
}
export const layersData: LayerItem[] = [
  {
    id: "presentation",
    label: "1. Presentation Layer",
    icon: Server,
    badge: "Fastify 5 Controllers",
    path: "apps/api/src/modules/[domain]/presentation/",
    description:
      "The HTTP gateway. Controllers remain thin, performing 0 business logic. They authenticate requests, enforce FGA permissions, validate input DTOs, invoke CQRS commands/queries, and map Result<T, E> to HTTP responses with localized i18n messages.",
    responsibilities: [
      "Controller routes: Maps HTTP methods to use cases.",
      "FGA Guards: @RequirePermission() enforces RBAC/ReBAC.",
      "Idempotency: @Idempotent() prevents double mutations.",
      "Tenant Context: @TenantAgnostic() declares scope.",
      "Validation: ZodValidationPipe parses against @repo/contracts.",
      "Error Mapping: Localized JSON error payloads.",
    ],
    codeSnippet: `@Controller("notes")
@UseGuards(AuthGuard, TenantContextGuard, PermissionsGuard)
export class NotesController {
  @Post()
  @RequirePermission("notes:create")
  @Idempotent()
  async create(@Body() body: CreateNoteInput, @CurrentUser() user: UserPayload) {
    const result = await this.createNoteCommand.execute({
      title: body.title,
      content: body.content,
      userId: user.id,
    });
    return handleResult(result, (note) => noteResponseMapper(note), this.i18n);
  }
}`,
  },
  {
    id: "application",
    label: "2. Application Layer",
    icon: Cpu,
    badge: "CQRS Lite Use Cases",
    path: "apps/api/src/modules/[domain]/application/",
    description:
      "Orchestrates business use cases. Divided into atomic Command handlers (mutations) and Query handlers (reads). Commands coordinate domain entities, repositories, and transactional outbox events, returning neverthrow Result<T, E>.",
    responsibilities: [
      "Single-Responsibility: One command/query per file (<150 lines).",
      "Neverthrow Result: Handlers return Result<T, DomainError>.",
      "Transactional Orchestration: Saves entity and emits outbox event in 1 tx.",
      "Domain Event Listeners: Listens to internal domain events.",
      "Policy Evaluation: Evaluates domain authorization rules.",
    ],
    codeSnippet: `@Injectable()
export class CreateNoteCommand {
  async execute(input: CreateNoteDto): Promise<Result<Note, NoteCreationError>> {
    const noteResult = Note.create(input);
    if (noteResult.isErr()) return err(noteResult.error);
    const note = noteResult.value;
    return await this.notesRepository.transaction(async (tx) => {
      const saved = await this.notesRepository.save(note, tx);
      await this.outbox.emit(new NoteCreatedEvent(saved), tx);
      return ok(saved);
    });
  }
}`,
  },
  {
    id: "domain",
    label: "3. Domain Layer",
    icon: Shield,
    badge: "Pure Business Models",
    path: "apps/api/src/modules/[domain]/domain/",
    description:
      "The core heart of the enterprise logic. Contains pure TypeScript entities, value objects, domain events, and domain errors with ZERO external framework, NestJS, or ORM dependencies.",
    responsibilities: [
      "Entity Invariants: Factory methods enforce business rules.",
      "Value Objects: Immutable structures with validation.",
      "Domain Events: Strongly-typed state change records.",
      "Domain Errors: Specific failure error codes.",
      "Zero Framework Coupling: 100% pure TypeScript.",
    ],
    codeSnippet: `export class Note {
  static create(props: CreateNoteProps): Result<Note, NoteValidationError> {
    if (!props.title || props.title.trim().length === 0) {
      return err(new NoteValidationError("Note title cannot be empty"));
    }
    return ok(new Note(crypto.randomUUID(), props.tenantId, props.userId, props.title.trim(), props.content, new Date()));
  }
}`,
  },
  {
    id: "infrastructure",
    label: "4. Infrastructure Layer",
    icon: Database,
    badge: "Drizzle & Technical Drivers",
    path: "apps/api/src/infrastructure/",
    description:
      "Adapts technical providers and data persistence. Contains Drizzle ORM schemas, TenantScopedRepositories, Redis caching & rate limiters, BullMQ background queues, Piscina worker pools, and OpenTelemetry exporters.",
    responsibilities: [
      "Drizzle ORM: PostgreSQL relational persistence.",
      "TenantScopedRepository: Auto multi-tenant isolation.",
      "Redis Caching & Rate Limiting with TTL.",
      "Piscina Worker Threads: Offloads heavy CPU work.",
      "Transactional Outbox Relay: Relays rows to Redis/BullMQ.",
    ],
    codeSnippet: `@Injectable()
export class NotesRepository extends TenantScopedRepository<NoteTable> {
  async findById(id: string): Promise<Note | null> {
    const row = await this.scopedQuery()
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, id))
      .limit(1);
    return row[0] ? NoteMapper.toDomain(row[0]) : null;
  }
}`,
  },
  {
    id: "packages",
    label: "5. Capability Packages",
    icon: Package,
    badge: "Shared Core Monorepo",
    path: "packages/*",
    description:
      "Reusable, focused monorepo capability packages consumed by API, Web, and background jobs, ensuring absolute DRY alignment across the codebase.",
    responsibilities: [
      "@repo/contracts: Zod 4 schemas & oRPC routes.",
      "@repo/authorization: Pure FGA RBAC+ReBAC+ABAC.",
      "@repo/i18n: Locale dictionaries & key resolvers.",
      "@repo/api-client: Type-safe client with auto-refresh.",
      "@repo/email: React Email transactional templates.",
      "@repo/ui: Accessible Base UI + Tailwind 4 design system.",
    ],
    codeSnippet: `// @repo/contracts/src/contracts/notes.contract.ts
export const notesContract = {
  create: oc.route({ method: "POST", path: "/notes" }).input(CreateNoteSchema).output(NoteSchema),
  list: oc.route({ method: "GET", path: "/notes" }).input(PaginationQuerySchema).output(NoteListResponseSchema),
};`,
  },
];
