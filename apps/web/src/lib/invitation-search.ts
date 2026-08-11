export interface InvitationSearch {
  invitationToken?: string;
}

export function validateInvitationSearch(search: Record<string, unknown>): InvitationSearch {
  return {
    invitationToken:
      typeof search.invitationToken === "string" ? search.invitationToken : undefined,
  };
}
