import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/lib/api", () => ({ api: { notes: { getNotes: vi.fn(), deleteNote: vi.fn() } } }));

import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotesList } from "./NotesList";

function renderWithClient(ui: React.ReactElement) {
  const testClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={testClient}>{ui}</QueryClientProvider>);
}

describe("NotesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().login({
      user: {
        id: "u1",
        email: "user@test.com",
        name: "Test User",
        role: "user",
      },
    });
  });

  it("renders notes returned by the API", async () => {
    vi.mocked(api.notes.getNotes).mockResolvedValue({
      status: 200,
      body: { items: [note()], total: 1, page: 1, limit: 50, totalPages: 1 },
    } as never);
    renderWithClient(<NotesList />);

    expect(await screen.findByText("First note")).toBeTruthy();
    expect(screen.getByText("Note content")).toBeTruthy();
    expect(api.notes.getNotes).toHaveBeenCalledWith({ query: { page: 1, limit: 50 } });
  });

  it("removes a note after a successful deletion", async () => {
    vi.mocked(api.notes.getNotes)
      .mockResolvedValueOnce({
        status: 200,
        body: { items: [note()], total: 1, page: 1, limit: 50, totalPages: 1 },
      } as never)
      .mockResolvedValueOnce({
        status: 200,
        body: { items: [], total: 0, page: 1, limit: 50, totalPages: 0 },
      } as never);
    vi.mocked(api.notes.deleteNote).mockResolvedValue({ status: 204, body: undefined } as never);
    renderWithClient(<NotesList />);

    await screen.findByText("First note");
    fireEvent.click(screen.getByRole("button", { name: "common.delete" }));

    await waitFor(() =>
      expect(api.notes.deleteNote).toHaveBeenCalledWith({ params: { id: "note-1" } }),
    );
    await waitFor(() => expect(screen.queryByText("First note")).toBeNull());
  });

  it("shows an error state when the notes request fails", async () => {
    vi.mocked(api.notes.getNotes).mockResolvedValue({
      status: 500,
      body: { message: "Failed" },
    } as never);
    renderWithClient(<NotesList />);

    expect(await screen.findByText("api.note.fetchFailed")).toBeTruthy();
  });
});

function note() {
  return {
    id: "note-1",
    title: "First note",
    content: "Note content",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}
