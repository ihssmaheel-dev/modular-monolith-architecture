import { oc } from "@orpc/contract";
import { organizationsContract } from "./organizations.contract";
import { membershipsContract } from "./memberships.contract";

export const tenancyContract = oc.router({
  ...organizationsContract,
  ...membershipsContract,
});
