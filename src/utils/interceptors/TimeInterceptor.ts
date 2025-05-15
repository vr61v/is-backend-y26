import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Response } from "express";

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - startTime;
        response.setHeader("X-Elapsed-Time", `${elapsedTime}ms`);
        if (response.locals) response.locals.serverProcessingTime = elapsedTime;
      }),
    );
  }
}
