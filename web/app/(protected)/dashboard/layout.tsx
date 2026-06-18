import { AppSidebar } from "@/components/app-sidebar"
import { CommandPaletteProvider } from "@/components/command-palette-provider"
import { DashboardRealtime } from "@/components/dashboard-realtime"
import { IntegrationsPrefetch } from "@/components/integrations-prefetch"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CommandPaletteProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <DashboardRealtime />
          <IntegrationsPrefetch />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="@container/main flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
