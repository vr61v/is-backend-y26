import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "@/auth/decorator/roles";
import { SessionRequest } from "supertokens-node/framework/express";
import { Response } from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import UserRoles from "supertokens-node/recipe/userroles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private async fetchRoles(req: SessionRequest, res: Response) {
    let userId: string | undefined;
    await verifySession()(req, res, () => {
      userId = req.session?.getUserId();
    });

    if (!userId) throw new UnauthorizedException("you are not authorized");
    return await UserRoles.getRolesForUser("public", userId);
  }

  private matchRoles(requiredRoles: string[], roles: string[]): boolean {
    return requiredRoles.some((role) => roles.includes(role));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [req, res] = [
      context.switchToHttp().getRequest<SessionRequest>(),
      context.switchToHttp().getResponse<Response>(),
    ];

    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) return true;

    const roles = await this.fetchRoles(req, res);
    return roles.status === "OK"
      ? this.matchRoles(requiredRoles, roles.roles)
      : false;
  }
}
