import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers["authorization"];

    if (!authorization) {
      return false;
    }

    return authorization.startsWith("Bearer ");
  }
}
