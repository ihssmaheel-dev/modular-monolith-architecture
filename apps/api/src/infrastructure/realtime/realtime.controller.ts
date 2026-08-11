import { Controller, Sse, Req, MessageEvent as NestMessageEvent } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { RealtimeService } from "./realtime.service";
import { Subject, Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { requireAuthenticatedUser } from "../../common/utils/request-user.utils";

@Controller("realtime")
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse("events")
  sse(@Req() request: FastifyRequest): Observable<NestMessageEvent> {
    const user = requireAuthenticatedUser(request);

    const subject = new Subject<NestMessageEvent>();
    this.realtimeService.addSseClient(user.sub, subject);

    subject.next({ data: { status: "connected" } } as NestMessageEvent);

    return subject.asObservable().pipe(
      finalize(() => {
        this.realtimeService.removeSseClient(user.sub, subject);
      }),
    );
  }
}
