import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { UserDeletedEvent, UserUpdatedEvent } from "../../../users/domain/events/user.events";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";

@Injectable()
export class MembershipUserListener {
  constructor(
    private readonly memberships: MembershipsRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  @OnEvent("user.updated")
  async updateSnapshots(event: UserUpdatedEvent): Promise<void> {
    try {
      await this.memberships.updateUserSnapshot(event.userId, event.changes);
    } catch (error) {
      this.logger.error({ error, userId: event.userId }, "Membership snapshot update failed");
    }
  }

  @OnEvent("user.deleted")
  async removeMemberships(event: UserDeletedEvent): Promise<void> {
    try {
      await this.memberships.removeUser(event.userId);
    } catch (error) {
      this.logger.error({ error, userId: event.userId }, "Membership cleanup failed");
    }
  }
}
