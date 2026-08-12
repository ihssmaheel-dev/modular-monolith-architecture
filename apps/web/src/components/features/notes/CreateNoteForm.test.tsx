import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/lib/api", () => ({ api: { notes: { createNote: vi.fn() } } }));

import { api } from "@/lib/api";
import { CreateNoteForm } from "./CreateNoteForm";

describe("CreateNoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a note and clears the form after success", async () => {
    vi.mocked(api.notes.createNote).mockResolvedValue({
      status: 201,
      body: { id: "note-1", title: "Title", content: "Content", createdAt: "2026-01-01" },
    } as never);
    const onSuccess = vi.fn();
    render(<CreateNoteForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText("notes.noteTitle"), { target: { value: "Title" } });
    fireEvent.change(screen.getByLabelText("notes.content"), { target: { value: "Content" } });
    fireEvent.click(screen.getByRole("button", { name: "notes.createButton" }));

    await waitFor(() =>
      expect(api.notes.createNote).toHaveBeenCalledWith({
        body: { title: "Title", content: "Content" },
      }),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("notes.noteTitle")).toHaveValue("");
    expect(screen.getByLabelText("notes.content")).toHaveValue("");
  });

  it("shows the server error message when creation fails", async () => {
    vi.mocked(api.notes.createNote).mockResolvedValue({
      status: 400,
      body: { message: "Title is required" },
    } as never);
    render(<CreateNoteForm />);

    fireEvent.change(screen.getByLabelText("notes.noteTitle"), { target: { value: "Title" } });
    fireEvent.change(screen.getByLabelText("notes.content"), { target: { value: "Content" } });
    fireEvent.click(screen.getByRole("button", { name: "notes.createButton" }));

    expect(await screen.findByText("Title is required")).toBeTruthy();
  });
});
