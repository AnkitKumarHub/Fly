import { Skeleton } from "@/components/ui/skeleton"
import { dashboardTokens } from "@/components/dashboard/dashboard-tokens"

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className={dashboardTokens.grid}>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className={dashboardTokens.card}>
          <Skeleton className="h-5 w-36" />
          <div className="mt-6 flex flex-1 flex-col gap-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
