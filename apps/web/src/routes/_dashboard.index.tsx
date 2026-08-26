import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardHeroSection } from "@/components/features/dashboard/hero-section";
import { CategoryShowcase } from "@/components/features/dashboard/category-showcase";
import { DashboardTelemetryCards } from "@/components/features/dashboard/telemetry-cards";
import { DashboardStarterActions } from "@/components/features/dashboard/starter-actions";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await api.users.list({
        query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
      });
      if (result.status !== 200) throw new Error("USERS_FETCH_FAILED");
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: tenancyData } = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => {
      const res = await api.tenancy.status();
      return res.status === 200 ? res.body : null;
    },
    staleTime: Infinity,
  });

  return (
    <div className="space-y-10 pb-12">
      <DashboardHeroSection />
      <CategoryShowcase />
      <DashboardTelemetryCards
        userCount={usersData?.total ?? 0}
        usersLoading={usersLoading}
        tenancyMode={tenancyData?.mode}
      />
      <DashboardStarterActions />
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});
