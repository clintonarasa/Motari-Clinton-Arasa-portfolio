import {
  User, FileText, Code2, Briefcase, FolderKanban,
  GraduationCap, Award, Heart, Users, Settings, LogOut, ArrowLeft, LayoutDashboard, BookOpen, Wrench
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useLocation, useNavigate } from "react-router-dom";
import localAuth from "@/integrations/localAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const contentItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/admin/profile", icon: User },
  { title: "Summary", url: "/admin/summary", icon: FileText },
  { title: "Skills", url: "/admin/skills", icon: Code2 },
  { title: "Experience", url: "/admin/experience", icon: Briefcase },
  { title: "Projects", url: "/admin/projects", icon: FolderKanban },
  { title: "Education", url: "/admin/education", icon: GraduationCap },
  { title: "Awards", url: "/admin/awards", icon: Award },
  { title: "Hobbies", url: "/admin/hobbies", icon: Heart },
  { title: "References", url: "/admin/references", icon: Users },
  { title: "Services", url: "/admin/services", icon: Wrench },
  { title: "Blog Articles", url: "/admin/blog", icon: BookOpen },
];

const systemItems = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Header */}
        <div className={`px-4 py-4 border-b border-border ${collapsed ? "text-center" : ""}`}>
          {collapsed ? (
            <span className="font-display text-lg text-primary">A</span>
          ) : (
            <>
              <h2 className="font-display text-lg">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Portfolio Manager</p>
            </>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="hover:bg-muted/50 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Back to Site</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={async () => {
                      await localAuth.signOut();
                      navigate("/admin");
                    }}
                    className="w-full text-left hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Sign Out</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
