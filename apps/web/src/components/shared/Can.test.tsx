import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Can } from "./Can";
import { useAuthStore } from "@/stores/auth.store";
import { Permissions } from "@repo/authorization";

describe("<Can /> Component", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("renders fallback when unauthorized", () => {
    render(
      <Can do={Permissions.USERS_DELETE} fallback={<div>Access Denied</div>}>
        <div>Delete User Button</div>
      </Can>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Delete User Button")).not.toBeInTheDocument();
  });

  it("renders children when authorized", () => {
    useAuthStore.getState().login({
      user: {
        id: "u1",
        email: "user@test.com",
        name: "User Test",
        role: "user",
      },
    });

    render(
      <Can do={Permissions.NOTES_CREATE} fallback={<div>Access Denied</div>}>
        <div>Create Note Form</div>
      </Can>,
    );

    expect(screen.getByText("Create Note Form")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("supports render props function as child", () => {
    render(
      <Can do={Permissions.USERS_DELETE}>
        {(allowed) => <button disabled={!allowed}>Delete</button>}
      </Can>,
    );

    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDisabled();
  });

  it("evaluates resource-level authorization (ReBAC)", () => {
    useAuthStore.getState().login({
      user: {
        id: "alice-1",
        email: "alice@test.com",
        name: "Alice",
        role: "user",
      },
    });

    const ownNote = { id: "note-1", type: "note", ownerId: "alice-1" };

    render(
      <Can do={Permissions.NOTES_UPDATE} resource={ownNote} fallback={<div>Denied</div>}>
        <div>Edit Note</div>
      </Can>,
    );

    expect(screen.getByText("Edit Note")).toBeInTheDocument();
  });
});
