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
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

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
  //   const [showSearch, setShowSearch] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-semibold">SprintPilot</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
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

                {/* Our logout handler */}
                <SignOutButton />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
