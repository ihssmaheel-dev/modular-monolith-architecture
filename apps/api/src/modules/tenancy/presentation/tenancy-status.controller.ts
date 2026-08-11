import { Controller } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { tenancyContract } from "@repo/shared";
import { Public, TenantAgnostic } from "../../../common";
import { env } from "../../../config/env";

@Controller("tenancy")
@TenantAgnostic()
export class TenancyStatusController {
  @TsRestHandler(tenancyContract.status)
  @Public()
  status() {
    return tsRestHandler(tenancyContract.status, async () => ({
      status: 200 as const,
      body: { mode: env.TENANCY_MODE, header: "x-tenant-id" as const },
    }));
  }
}
