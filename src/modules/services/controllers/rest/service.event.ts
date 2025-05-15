import { Controller, OnModuleDestroy, OnModuleInit, Sse } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ServiceEvent } from "../../entities/service.event";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EventOperation } from "@/modules/services/enums/event.operation.enum";

interface SseResponse {
  data: {
    name: string;
  };
}

@ApiTags("Services notifications controller")
@Controller("api/services/notification")
export class ServiceEventsController implements OnModuleInit, OnModuleDestroy {
  private readonly serviceCreateSubject = new Subject<ServiceEvent>();
  private readonly serviceUpdateSubject = new Subject<ServiceEvent>();
  private readonly serviceDeleteSubject = new Subject<ServiceEvent>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  private setupEventListeners(): void {
    this.eventEmitter.on(EventOperation.CREATE, (event: ServiceEvent) =>
      this.serviceCreateSubject.next(event),
    );
    this.eventEmitter.on(EventOperation.UPDATE, (event: ServiceEvent) =>
      this.serviceUpdateSubject.next(event),
    );
    this.eventEmitter.on(EventOperation.DELETE, (event: ServiceEvent) =>
      this.serviceDeleteSubject.next(event),
    );
  }

  private cleanupEventListeners(): void {
    this.eventEmitter.removeAllListeners(EventOperation.CREATE);
    this.eventEmitter.removeAllListeners(EventOperation.UPDATE);
    this.eventEmitter.removeAllListeners(EventOperation.DELETE);
  }

  private formatSseResponse(event: ServiceEvent): SseResponse {
    return {
      data: { name: event.name },
    };
  }

  onModuleInit(): void {
    this.setupEventListeners();
  }

  onModuleDestroy(): void {
    this.cleanupEventListeners();
  }

  @ApiOperation({ summary: "Subscribe to service creation events" })
  @ApiOkResponse({
    description: "SSE stream for service creation events",
  })
  @Sse("create")
  sendCreate(): Observable<SseResponse> {
    return this.serviceCreateSubject.pipe(
      map((event) => this.formatSseResponse(event)),
    );
  }

  @ApiOperation({ summary: "Subscribe to service update events" })
  @ApiOkResponse({
    description: "SSE stream for service update events",
  })
  @Sse("update")
  sendUpdate(): Observable<SseResponse> {
    return this.serviceUpdateSubject.pipe(
      map((event) => this.formatSseResponse(event)),
    );
  }

  @ApiOperation({ summary: "Subscribe to service deletion events" })
  @ApiOkResponse({
    description: "SSE stream for service deletion events",
  })
  @Sse("delete")
  sendDelete(): Observable<SseResponse> {
    return this.serviceDeleteSubject.pipe(
      map((event) => this.formatSseResponse(event)),
    );
  }
}
