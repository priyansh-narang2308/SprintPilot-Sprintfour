import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Wand2,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Edit2,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface Competitor {
  id: number;
  name: string;
  description: string;
  pricing: string;
  website_url: string;
  strengths: string[];
  weaknesses: string[];
  notes: string;
}

const swotAnalysis = {
  strengths: [
    "AI-powered automation saves significant time",
    "All-in-one solution for product planning",
    "Beautiful, modern user interface",
    "Easy onboarding and learning curve",
  ],
  weaknesses: [
    "New entrant with limited brand recognition",
    "Dependent on AI quality and accuracy",
    "Limited integration ecosystem initially",
  ],
  opportunities: [
    "Growing demand for AI-powered tools",
    "Remote work driving documentation needs",
    "Underserved solo founder segment",
    "Potential for vertical-specific solutions",
  ],
  threats: [
    "Established competitors adding AI features",
    "Economic downturn reducing startup funding",
    "AI regulation and compliance requirements",
  ],
};

const CompetitiveAnalysisPage = () => {
  const { user } = useAuth();

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricing: "",
    website_url: "",
    strengths: "",
    weaknesses: "",
    notes: "",
  });

  const currentWorkspaceId = localStorage.getItem("currentWorkspaceId");

  const fetchCompetitors = useCallback(async () => {
    if (!currentWorkspaceId) {
      setLoading(false);
      setCompetitors([]);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCompetitors(
        (data?.map((item: Record<string, unknown>) => ({
          ...item,
          strengths: Array.isArray(item.strengths)
            ? (item.strengths as string[])
            : [],
          weaknesses: Array.isArray(item.weaknesses)
            ? (item.weaknesses as string[])
            : [],
        })) as Competitor[]) || []
      );
    } catch (error) {
      console.error("Error fetching competitors:", error);
      toast.error("Failed to fetch competitors");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspaceId && user) {
      fetchCompetitors();
    }
  }, [currentWorkspaceId, user, fetchCompetitors]);

  const handleAddCompetitor = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Competitor name is required");
        return;
      }

      const strengthsArray = formData.strengths
        .split("\n")
        .filter((s) => s.trim())
        .map((s) => s.trim());
      const weaknessesArray = formData.weaknesses
        .split("\n")
        .filter((w) => w.trim())
        .map((w) => w.trim());

      if (editingId) {
        const { error } = await supabase
          .from("competitors")
          .update({
            name: formData.name,
            description: formData.description,
            pricing: formData.pricing,
            website_url: formData.website_url,
            strengths: strengthsArray,
            weaknesses: weaknessesArray,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Competitor updated successfully");
      } else {
        const { error } = await supabase.from("competitors").insert({
          workspace_id: currentWorkspaceId,
          user_id: user?.id,
          name: formData.name,
          description: formData.description,
          pricing: formData.pricing,
          website_url: formData.website_url,
          strengths: strengthsArray,
          weaknesses: weaknessesArray,
          notes: formData.notes,
        });

        if (error) throw error;
        toast.success("Competitor added successfully");
      }

      resetForm();
      fetchCompetitors();
    } catch (error) {
      console.error("Error saving competitor:", error);
      toast.error("Failed to save competitor");
    }
  };

  const handleDeleteCompetitor = async (id: number) => {
    try {
      const { error } = await supabase
        .from("competitors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Competitor deleted successfully");
      fetchCompetitors();
    } catch (error) {
      console.error("Error deleting competitor:", error);
      toast.error("Failed to delete competitor");
    }
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingId(competitor.id);
    setFormData({
      name: competitor.name,
      description: competitor.description || "",
      pricing: competitor.pricing || "",
      website_url: competitor.website_url || "",
      strengths: competitor.strengths.join("\n"),
      weaknesses: competitor.weaknesses.join("\n"),
      notes: competitor.notes || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      pricing: "",
      website_url: "",
      strengths: "",
      weaknesses: "",
      notes: "",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout title="Competitive Analysis">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Competitive Analysis</h1>
            <p className="text-muted-foreground">
              Understand your market position
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Export Report</span>
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">AI Analysis</span>
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Add</span>
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No competitors yet</p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first competitor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                      Competitor
                    </th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-sm hidden md:table-cell">
                      Pricing
                    </th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                      Strengths
                    </th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-sm hidden lg:table-cell">
                      Weaknesses
                    </th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor) => (
                    <tr
                      key={competitor.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0">
                            {getInitials(competitor.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm sm:text-base">
                              {competitor.name}
                            </p>
                            {competitor.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {competitor.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <span className="font-medium text-sm">
                          {competitor.pricing || "-"}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex flex-wrap gap-1">
                          {competitor.strengths.length > 0 ? (
                            competitor.strengths.slice(0, 2).map((s, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-chart-4/10"
                              >
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                          {competitor.strengths.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{competitor.strengths.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {competitor.weaknesses.length > 0 ? (
                            competitor.weaknesses.slice(0, 2).map((w, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-destructive/10"
                              >
                                {w}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                          {competitor.weaknesses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{competitor.weaknesses.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompetitor(competitor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteCompetitor(competitor.id)
                            }
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">SWOT Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-chart-4/10 rounded-2xl border border-chart-4/30 p-5">
              <h3 className="font-semibold text-chart-4 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.strengths.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-4 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-destructive/10 rounded-2xl border border-destructive/30 p-5">
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Weaknesses
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-chart-3/10 rounded-2xl border border-chart-3/30 p-5">
              <h3 className="font-semibold text-chart-3 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.opportunities.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-3 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-chart-5/10 rounded-2xl border border-chart-5/30 p-5">
              <h3 className="font-semibold text-chart-5 mb-3 flex items-center gap-2">
                <Minus className="w-4 h-4" />
                Threats
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.threats.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl">
              {editingId ? "Edit Competitor" : "Add New Competitor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 px-6 pb-6">
            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Competitor Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Linear, Jira, Asana"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <Input
                  placeholder="Brief description of the competitor"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full text-base"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pricing
                  </label>
                  <Input
                    placeholder="e.g., $10/user/mo"
                    value={formData.pricing}
                    onChange={(e) =>
                      setFormData({ ...formData, pricing: e.target.value })
                    }
                    className="w-full text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Website URL
                  </label>
                  <Input
                    placeholder="https://example.com"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData({ ...formData, website_url: e.target.value })
                    }
                    className="w-full text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Strengths
                </label>
                <Textarea
                  placeholder="List strengths, one per line&#10;e.g., Fast UI&#10;Great support&#10;Good pricing"
                  value={formData.strengths}
                  onChange={(e) =>
                    setFormData({ ...formData, strengths: e.target.value })
                  }
                  rows={4}
                  className="w-full resize-none text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Enter each strength on a new line
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Weaknesses
                </label>
                <Textarea
                  placeholder="List weaknesses, one per line&#10;e.g., Limited features&#10;Expensive&#10;Steep learning curve"
                  value={formData.weaknesses}
                  onChange={(e) =>
                    setFormData({ ...formData, weaknesses: e.target.value })
                  }
                  rows={4}
                  className="w-full resize-none text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Enter each weakness on a new line
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any other observations about this competitor"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full resize-none text-base"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm} className="px-6">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleAddCompetitor}
                className="px-6"
              >
                {editingId ? "Update Competitor" : "Add Competitor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CompetitiveAnalysisPage;
