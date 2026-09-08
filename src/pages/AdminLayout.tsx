import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import PageTransition from "@/components/portfolio/PageTransition";

const AdminLayout = () => {
  return (
    <PageTransition>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 flex items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-none">Portfolio Admin</span>
                  <span className="text-xs text-muted-foreground mt-1 hidden sm:block">Manage your content and settings</span>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6 md:p-8 bg-muted/10 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <Outlet />
              </div>
            </main>
            <footer className="border-t border-border bg-card/50 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Portfolio Admin. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </PageTransition>
  );
};

export default AdminLayout;
