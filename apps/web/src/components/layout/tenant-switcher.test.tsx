import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/lib/api", () => ({
  api: {
    tenancy: {
      status: vi.fn(),
      listOrganizations: vi.fn(),
      createOrganization: vi.fn(),
    },
  },
}));

import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { TenantSwitcher } from "./tenant-switcher";

const tenantId = "507f1f77bcf86cd799439011";

describe("TenantSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTenantStore.getState().clearTenant();
  });

  it("does not render when tenancy is disabled", async () => {
    vi.mocked(api.tenancy.status).mockResolvedValue({
      status: 200,
      body: { mode: "single", header: "x-tenant-id" },
    } as never);

    renderSwitcher();

    await waitFor(() => expect(api.tenancy.status).toHaveBeenCalledOnce());
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("selects the first organization when no tenant is active", async () => {
    vi.mocked(api.tenancy.status).mockResolvedValue({
      status: 200,
      body: { mode: "multi", header: "x-tenant-id" },
    } as never);
    vi.mocked(api.tenancy.listOrganizations).mockResolvedValue({
      status: 200,
      body: { items: [organization()], total: 1, page: 1, limit: 100, totalPages: 1 },
    } as never);

    renderSwitcher();

    expect(await screen.findByRole("combobox")).toHaveValue(tenantId);
    expect(useTenantStore.getState().activeTenantId).toBe(tenantId);
  });
});

function renderSwitcher() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TenantSwitcher />
    </QueryClientProvider>,
  );
}

function organization() {
  return {
    id: tenantId,
    name: "Acme",
    slug: "acme",
    role: "owner",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}
