import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as crypto from "crypto";
import { Request, Response } from "express";

@Injectable()
export class ETagInterceptor<T> implements NestInterceptor<T, T | null> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | null> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    if (request.method !== "GET") return next.handle();

    return next.handle().pipe(
      map((data: T) => {
        const etag = crypto
          .createHash("sha1")
          .update(JSON.stringify(data))
          .digest("hex");

        response.setHeader("ETag", etag);
        const clientEtag = request.headers.etag;
        if (clientEtag && clientEtag === etag) {
          response.status(304);
          return null;
        }

        return data;
      }),
    );
  }
}
