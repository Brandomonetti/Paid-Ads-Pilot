import { AppSidebar } from '../app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background p-8">
          <h2 className="text-2xl font-bold">Main Content Area</h2>
          <p className="text-muted-foreground mt-2">The sidebar provides navigation to all AI agents and settings.</p>
        </div>
      </div>
    </SidebarProvider>
  )
}