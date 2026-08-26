import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { Public, TenantAgnostic } from "../../../common";
import { env } from "../../../config/env";
import type { TenantStatusResponse } from "@repo/contracts";

@Controller("tenancy")
@TenantAgnostic()
export class TenancyStatusController {
  @Get("status")
  @HttpCode(HttpStatus.OK)
  @Public()
  status(): TenantStatusResponse {
    return { mode: env.TENANCY_MODE, header: "x-tenant-id" };
  }
}
