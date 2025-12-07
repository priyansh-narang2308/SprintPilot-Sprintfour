import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  GitBranch,
  Layout,
  Calendar,
  BarChart3,
  ListTodo,
  Settings,
  ChevronLeft,
  ChevronRight,
  Rocket,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "PRD", href: "/dashboard/prd", icon: FileText },
  { name: "Personas", href: "/dashboard/personas", icon: Users },
  { name: "Journey Maps", href: "/dashboard/journeys", icon: GitBranch },
  { name: "Wireframes", href: "/dashboard/wireframes", icon: Layout },
  { name: "Roadmaps", href: "/dashboard/roadmaps", icon: Calendar },
  {
    name: "Competitive Analysis",
    href: "/dashboard/competitive",
    icon: BarChart3,
  },
  { name: "Backlog", href: "/dashboard/backlog", icon: ListTodo },
];

const SignOutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { success, error } = await logout();

    if (success) {
      toast.success("Signed out");
      navigate("/login");
    } else {
      toast.error(error ?? "Failed to sign out");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
    >
      Sign out
    </Button>
  );
};

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // load current workspace from localStorage
    const stored = localStorage.getItem("current_workspace");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedWorkspace(parsed);
      } catch (e) {
        // ignore
      }
    }
    if (user) fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchWorkspaces = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("workspaces")
      .select("id,name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("fetch workspaces", error);
      return;
    }
    const list = (data as Array<{ id: string; name: string }>) || [];
    setWorkspaces(list);
    if (!selectedWorkspace && list.length) {
      setSelectedWorkspace({ id: list[0].id, name: list[0].name });
      localStorage.setItem(
        "current_workspace",
        JSON.stringify({ id: list[0].id, name: list[0].name })
      );
    }
  };

  const createWorkspace = async () => {
    if (!user) return toast.error("Please sign in to create a workspace");
    if (!newWorkspaceName.trim())
      return toast.error("Workspace name is required");
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name: newWorkspaceName.trim(), user_id: user.id })
        .select("id,name")
        .single();
      if (error) throw error;
      // delete previous workspace data for this user (all PRDs linked to other workspaces)
      const { data: otherWs } = await supabase
        .from("workspaces")
        .select("id")
        .eq("user_id", user.id)
        .neq("id", data.id);
      const prevIds = (otherWs || []).map((w: { id: string }) => w.id);
      if (prevIds.length) {
        const { error: delErr } = await supabase
          .from("prds")
          .delete()
          .in("workspace_id", prevIds);
        if (delErr) console.error("delete previous prds error", delErr);
      }
      // optionally delete old workspaces (keep or remove: here we keep them but clear their PRDs)
      setNewWorkspaceName("");
      setCreateOpen(false);
      await fetchWorkspaces();
      setSelectedWorkspace({ id: data.id, name: data.name });
      localStorage.setItem(
        "current_workspace",
        JSON.stringify({ id: data.id, name: data.name })
      );
      toast.success("Workspace created");
    } catch (err) {
      console.error("create workspace", err);
      toast.error("Failed to create workspace");
    }
  };
  //   const [showSearch, setShowSearch] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64",
          // Mobile: hide by default, show when mobileMenuOpen is true
          "md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-semibold">SprintPilot</span>}
          </Link>
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Collapse button - hidden on mobile */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors hidden md:block"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Workspace selector - moved below title */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted transition-colors">
                  <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs shrink-0">
                    {selectedWorkspace
                      ? selectedWorkspace.name[0]?.toUpperCase()
                      : "W"}
                  </div>
                  <div className="text-sm truncate flex-1 text-left">
                    {selectedWorkspace
                      ? selectedWorkspace.name
                      : "Select workspace"}
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <div className="space-y-1 max-h-48 overflow-y-auto p-1">
                  {workspaces.length === 0 ? (
                    <DropdownMenuItem onSelect={() => { }}>
                      No workspaces
                    </DropdownMenuItem>
                  ) : (
                    workspaces.map((w) => (
                      <DropdownMenuItem
                        key={w.id}
                        onSelect={() => {
                          setSelectedWorkspace(w);
                          localStorage.setItem(
                            "current_workspace",
                            JSON.stringify(w)
                          );
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">
                            {w.name[0]?.toUpperCase()}
                          </div>
                          <div className="text-sm">{w.name}</div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                  + Add another workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 px-3 py-3 space-y-1">
          {bottomNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all",
                  collapsed && "justify-center px-0"
                )}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Sign out</span>}
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Sign out</DialogTitle>
                <DialogDescription>
                  Are you sure you want to sign out? You'll need to log in again
                  to continue.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <SignOutButton />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "md:ml-16" : "md:ml-64",
          "ml-0"
        )}
      >
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile menu button - inside header */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Create Workspace Dialog - centered on whole page */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] max-w-[90vw] bg-card rounded-lg p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Workspace</h3>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setCreateOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Workspace Name</label>
              <input
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createWorkspace();
                  }
                }}
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="hero" onClick={createWorkspace}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
