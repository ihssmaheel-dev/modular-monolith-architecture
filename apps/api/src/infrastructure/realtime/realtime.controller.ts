import { Controller, Sse, Query, UnauthorizedException, MessageEvent as NestMessageEvent } from "@nestjs/common";
import { RealtimeService } from "./realtime.service";
import { Subject, Observable } from "rxjs";
import { finalize } from "rxjs/operators";

@Controller("realtime")
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse("events")
  sse(@Query("userId") userId: string): Observable<NestMessageEvent> {
    if (!userId) {
      throw new UnauthorizedException("User ID is required for SSE connections");
    }

    const subject = new Subject<NestMessageEvent>();
    
    // Register the SSE client connection
    this.realtimeService.addSseClient(userId, subject);

    // Send an initial connected event
    subject.next({ data: { status: "connected", userId } } as NestMessageEvent);

    // When the HTTP connection drops, this finalize block fires
    return subject.asObservable().pipe(
      finalize(() => {
        this.realtimeService.removeSseClient(userId, subject);
      })
    );
  }
}
