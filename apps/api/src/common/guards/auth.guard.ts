import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { createHmac } from "crypto";
import { env } from "../../config/env";

const ALGORITHM = "HS256";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers["authorization"];

    if (!authorization?.startsWith("Bearer ")) {
      return false;
    }

    const token = authorization.slice(7);
    const decoded = this.verifyToken(token);
    if (!decoded) return false;
    
    request.user = decoded;
    return true;
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
        Buffer.from(payload, 'base64url').toString(),
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
