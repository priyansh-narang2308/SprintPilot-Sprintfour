import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's what's happening with your projects</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/dashboard/new">
              <Plus className="w-4 h-4" />
              New Blueprint
            </Link>
          </Button>
        </div>
        </div>
    </DashboardLayout>
  );
};

export default Dashboard;
