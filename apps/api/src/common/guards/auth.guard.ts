import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { createHmac } from "crypto";
import { env } from "../../config/env";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    const decoded = this.verifyToken(token);
    if (!decoded) return false;
    
    request.user = decoded;
    if (typeof decoded.sub === "string") {
      this.cls.set("userId", decoded.sub);
    }
    return true;
  }

  private extractToken(request: Record<string, unknown>): string | null {
    const headers = request.headers as Record<string, string> | undefined;
    const auth = headers?.authorization;
    if (auth?.startsWith("Bearer ")) {
      return auth.slice(7);
    }

    const cookies = request.cookies as Record<string, string> | undefined;
    if (cookies?.access_token) {
      return cookies.access_token;
    }

    return null;
  }

  private verifyToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [header, payload, signature] = parts;
      const expectedSig = createHmac('sha256', env.JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      if (signature !== expectedSig) return null;
      
      const decoded = JSON.parse(
        Buffer.from(payload!, 'base64url').toString(),
      ) as Record<string, unknown>;
      
      if (typeof decoded.exp === 'number' && decoded.exp * 1000 < Date.now()) {
        return null;
      }
      
      return decoded;
    } catch {
      return null;
    }
  }
}
