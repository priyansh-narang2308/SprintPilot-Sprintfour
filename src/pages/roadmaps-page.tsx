import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Wand2,
  GripVertical,
  Loader2,
  Trash2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { 
  generateRoadmapSuggestions, 
  type GeneratedRoadmapFeature 
} from "../lib/geiminiApi";
import { storage } from "../lib/storage";
import { Checkbox } from "../components/ui/checkbox";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  status: "now" | "next" | "later";
  priority: "Low" | "Medium" | "High";
  owner_id: string | null;
  tags: string[];
  position: number;
  created_at: string;
}

interface ColumnType {
  id: "now" | "next" | "later";
  name: string;
  color: string;
}

const COLUMNS: ColumnType[] = [
  { id: "now", name: "Now", color: "bg-chart-4" },
  { id: "next", name: "Next", color: "bg-chart-3" },
  { id: "later", name: "Later", color: "bg-chart-2" },
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const DraggableCard = ({
  feature,
  onDelete,
  onEdit,
}: {
  feature: RoadmapFeature;
  onDelete: (feature: RoadmapFeature) => void;
  onEdit: (feature: RoadmapFeature) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: feature.id,
    data: {
      type: "Feature",
      feature,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-md transition-all group touch-none"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-0.5"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-2 truncate">{feature.title}</h4>
          {feature.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {feature.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {feature.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-1 rounded-md font-bold border uppercase tracking-wider ${
                  feature.priority === "High"
                    ? "bg-red-500/10 text-red-600 border-red-200/50"
                    : feature.priority === "Medium"
                    ? "bg-amber-500/10 text-amber-600 border-amber-200/50"
                    : "bg-slate-500/10 text-slate-600 border-slate-200/50"
                }`}
              >
                {feature.priority}
              </span>
            </div>
          </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(feature)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(feature)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const RoadmapColumn = ({
  column,
  features,
  onDelete,
  onEdit,
  onAddClick,
}: {
  column: ColumnType;
  features: RoadmapFeature[];
  onDelete: (feature: RoadmapFeature) => void;
  onEdit: (feature: RoadmapFeature) => void;
  onAddClick: (status: "now" | "next" | "later") => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const columnFeatures = useMemo(
    () => features.map((f) => f.id),
    [features]
  );

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h3 className="font-semibold">{column.name}</h3>
        <span className="text-muted-foreground text-sm">
          {features.length} items
        </span>
      </div>


      <div ref={setNodeRef} className="bg-muted/10 rounded-xl p-2 min-h-[500px]">
        <SortableContext
          items={columnFeatures}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {features.map((feature) => (
              <DraggableCard
                key={feature.id}
                feature={feature}
                onDelete={() => onDelete(feature)}
                onEdit={onEdit}
              />
            ))}
          </div>
        </SortableContext>


        <button
          onClick={() => onAddClick(column.id)}
          className="w-full p-3 mt-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add feature
        </button>
      </div>
    </div>
  );
};

const RoadmapsPage = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<RoadmapFeature[]>([]);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDragFeature, setActiveDragFeature] =
    useState<RoadmapFeature | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "now" as "now" | "next" | "later",
    priority: "Medium" as "Low" | "Medium" | "High",
    tags: "" as string,
  });
  
  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<GeneratedRoadmapFeature[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const loadWorkspace = () => {
      const stored = localStorage.getItem("current_workspace");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedWorkspace(parsed);
        } catch (e) {
          console.error("Failed to parse workspace", e);
        }
      }
    };

    loadWorkspace();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "current_workspace") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setSelectedWorkspace(parsed);
          } catch (e) {
            console.error("Failed to parse workspace", e);
          }
        } else {
          setSelectedWorkspace(null);
        }
      }
    };

    const handleWorkspaceChange = () => {
      const stored = localStorage.getItem("current_workspace");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedWorkspace(parsed);
        } catch (e) {
          console.error("Failed to parse workspace", e);
          setSelectedWorkspace(null);
        }
      } else {
        setSelectedWorkspace(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("workspace-changed", handleWorkspaceChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("workspace-changed", handleWorkspaceChange);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initializeRoadmap = useCallback(
    async (workspaceId: string) => {
      if (!workspaceId || !user) {
        return null;
      }

      try {

        const { data: existingRoadmap, error: fetchError } = await supabase
          .from("roadmaps")
          .select("id")
          .eq("workspace_id", workspaceId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (existingRoadmap) {
          return existingRoadmap.id;
        }


        const { data: newRoadmap, error: createError } = await supabase
          .from("roadmaps")
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            title: "Product Roadmap",
          })
          .select("id")
          .single();

        if (createError) throw createError;
        return newRoadmap.id;
      } catch (error) {
        console.error("Error initializing roadmap:", error);
        toast.error("Failed to initialize roadmap");
        return null;
      }
    },
    [user]
  );

  const fetchFeatures = useCallback(async () => {
    if (!selectedWorkspace || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);


      const rmId = await initializeRoadmap(selectedWorkspace.id);
      if (!rmId) {
        setFeatures([]);
        setLoading(false);
        return;
      }

      setRoadmapId(rmId);


      const { data, error } = await supabase
        .from("roadmap_features")
        .select("*")
        .eq("roadmap_id", rmId)
        .is("deleted_at", null)
        .order("status")
        .order("position");

      if (error) throw error;

      setFeatures(
        (data?.map((item: Record<string, unknown>) => ({
          ...item,
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
        })) as RoadmapFeature[]) || []
      );
    } catch (error) {
      console.error("Error fetching features:", error);
      toast.error("Failed to fetch roadmap features");
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace, user, initializeRoadmap]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleAddFeature = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error("Feature title is required");
        return;
      }

      if (!selectedWorkspace) {
        toast.error("Please select a workspace first");
        return;
      }

      if (!user) {
        toast.error("User not authenticated");
        return;
      }


      let rmId = roadmapId;
      if (!rmId) {
        rmId = await initializeRoadmap(selectedWorkspace.id);
        if (!rmId) {
          toast.error("Failed to initialize roadmap");
          return;
        }
        setRoadmapId(rmId);
      }

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (editingId) {

        const { error } = await supabase
          .from("roadmap_features")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            tags: tagsArray,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Feature updated successfully");
      } else {

        const maxPosition =
          features
            .filter((f) => f.status === formData.status)
            .reduce((max, f) => Math.max(max, f.position), -1) + 1;

        const { error } = await supabase.from("roadmap_features").insert({
          roadmap_id: rmId,
          workspace_id: selectedWorkspace.id,
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          tags: tagsArray,
          position: maxPosition,
        });

        if (error) throw error;
        storage.logActivity("Added Roadmap Feature", formData.title);
        toast.success("Feature added successfully");
      }

      resetForm();
      fetchFeatures();
    } catch (error) {
      console.error("Error saving feature:", error);
      toast.error("Failed to save feature");
    }
  };


  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<RoadmapFeature | null>(null);

  const handleDeleteClick = (feature: RoadmapFeature) => {
    setFeatureToDelete(feature);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!featureToDelete) return;

    try {
      const { error } = await supabase
        .from("roadmap_features")
        .delete()
        .eq("id", featureToDelete.id);

      if (error) throw error;

      toast.success("Feature deleted successfully");
      fetchFeatures();
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Failed to delete feature");
    } finally {
      setDeleteDialogOpen(false);
      setFeatureToDelete(null);
    }
  };

  const handleEditFeature = (feature: RoadmapFeature) => {
    setEditingId(feature.id);
    setFormData({
      title: feature.title,
      description: feature.description,
      status: feature.status,
      priority: feature.priority,
      tags: feature.tags.join(", "),
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "now",
      priority: "Medium",
      tags: "",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description for your project");
      return;
    }

    setAiLoading(true);
    try {
      const suggestions = await generateRoadmapSuggestions(aiPrompt);
      setAiSuggestions(suggestions);

      setSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
    } catch (error) {
      toast.error("Failed to generate suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestions = async () => {
    if (selectedSuggestions.size === 0) {
      toast.error("Please select at least one feature");
      return;
    }

    if (!selectedWorkspace || !user) return;

    setLoading(true);

    try {

      let rmId = roadmapId;
      if (!rmId) {
        rmId = await initializeRoadmap(selectedWorkspace.id);
        if (!rmId) throw new Error("Could not initialize roadmap");
        setRoadmapId(rmId);
      }

      const featuresToAdd = aiSuggestions.filter((_, i) => selectedSuggestions.has(i));

      
      const insertions = featuresToAdd.map(f => {
     
         return {
            roadmap_id: rmId,
            workspace_id: selectedWorkspace.id,
            user_id: user.id,
            title: f.title,
            description: f.description,
            status: f.status,
            priority: f.priority,
            tags: f.tags,
            position: 999 
         };
      });

      const { error } = await supabase.from("roadmap_features").insert(insertions);

      if (error) throw error;

      toast.success(`Added ${featuresToAdd.length} features to roadmap`);
      setIsAIModalOpen(false);
      setAiSuggestions([]);
      setAiPrompt("");
      fetchFeatures();

    } catch (error) {
      console.error("Error adding AI features:", error);
      toast.error("Failed to add features");
      setLoading(false);
    }
  };
  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Feature") {
      setActiveDragFeature(event.active.data.current.feature as RoadmapFeature);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the feature objects
    const isActiveTask = active.data.current?.type === "Feature";
    const isOverTask = over.data.current?.type === "Feature";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Moving a task over another task
    if (isActiveTask && isOverTask) {
      // Find indexes
      const activeIndex = features.findIndex((f) => f.id === activeId);
      const overIndex = features.findIndex((f) => f.id === overId);

      if (features[activeIndex].status !== features[overIndex].status) {
        setFeatures((features) => {
          const newFeatures = [...features];
          // Ensure we don't duplicate
          newFeatures[activeIndex].status = features[overIndex].status;
          return arrayMove(newFeatures, activeIndex, overIndex);
        });
      }
    }

    // Moving a task over a column (empty or not, dropping on container)
    if (isActiveTask && isOverColumn) {
      const activeIndex = features.findIndex((f) => f.id === activeId);
      const overColumnId = over.id as "now" | "next" | "later";

      if (features[activeIndex].status !== overColumnId) {
        setFeatures((features) => {
          const newFeatures = [...features];
          newFeatures[activeIndex].status = overColumnId;
          return arrayMove(newFeatures, activeIndex, activeIndex); // don't move index, just status
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const feature = activeDragFeature;
    setActiveDragFeature(null);
    
    const { active, over } = event;
    if (!over) return;
    


    const activeId = active.id;
    const overId = over.id;

    const activeIndex = features.findIndex((f) => f.id === activeId);
    let newFeatures = [...features];
    let newStatus = newFeatures[activeIndex].status;
    let overIndex = -1;

    const isActiveTask = active.data.current?.type === "Feature";
    const isOverTask = over.data.current?.type === "Feature";
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverTask) {
       overIndex = features.findIndex((f) => f.id === overId);

       if (activeIndex !== overIndex) {
         newFeatures = arrayMove(newFeatures, activeIndex, overIndex);
         newStatus = newFeatures[overIndex].status; // should be same but good to ensure
       }
    } else if (isActiveTask && isOverColumn) {
      newStatus = over.id as "now" | "next" | "later";
    }

    setFeatures(newFeatures);

    if (feature && feature.status !== newStatus) {
      toast.success(`Moved to ${newStatus}`);
    }


    try {
      await supabase
         .from("roadmap_features")
         .update({
           status: newStatus,
         })
         .eq("id", activeId);

      
      const columnFeatures = newFeatures.filter(f => f.status === newStatus);

      const updates = columnFeatures.map((f, index) => ({
          id: f.id,
          position: index,
          status: newStatus 
      }));

   
      for (const update of updates) {
           await supabase
          .from("roadmap_features")
          .update({ position: update.position, status: update.status })
          .eq("id", update.id);
      }
      
    } catch (error) {
      console.error("Error updating positions:", error);
      toast.error("Failed to save order");
      fetchFeatures(); 
    }
  };

  const groupedFeatures = useMemo(() => {
    const acc = {
      now: [] as RoadmapFeature[],
      next: [] as RoadmapFeature[],
      later: [] as RoadmapFeature[],
    };
    features.forEach((f) => {
      if (acc[f.status]) acc[f.status].push(f);
    });
    return acc;
  }, [features]);

  if (!selectedWorkspace) {
    return (
      <DashboardLayout title="Roadmaps">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="bg-muted/30 p-6 rounded-full mb-6">
            <Wand2 className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            No Workspace Selected
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Please select a workspace from the sidebar to view and manage your
            product roadmap.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Roadmaps">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product Roadmap</h1>
            <p className="text-muted-foreground">
              Plan and prioritize your features
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAIModalOpen(true)}
                className="border-primary/20 hover:bg-primary/5 text-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggest
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Add Feature</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid md:grid-cols-3 gap-6">
              {COLUMNS.map((column) => (
                <RoadmapColumn
                  key={column.id}
                  column={column}
                  features={groupedFeatures[column.id]}
                  onDelete={handleDeleteClick}
                  onEdit={handleEditFeature}
                  onAddClick={(status) => {
                    setFormData({ ...formData, status });
                    setIsDialogOpen(true);
                  }}
                />
              ))}
            </div>
            
            {createPortal(
              <DragOverlay dropAnimation={dropAnimation}>
                {activeDragFeature && (
                  <DraggableCard
                    feature={activeDragFeature}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        )}
      </div>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Feature" : "Add New Feature"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., User authentication, API integration"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <Textarea
                placeholder="Describe the feature in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full resize-none text-base"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Timeline <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as "now" | "next" | "later",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Now</SelectItem>
                    <SelectItem value="next">Next</SelectItem>
                    <SelectItem value="later">Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as "Low" | "Medium" | "High",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Tags</label>
              <Input
                placeholder="e.g., Feature, UI, Integration (comma separated)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full text-base"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate tags with commas
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleAddFeature}>
                {editingId ? "Update Feature" : "Add Feature"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-primary" />
               Generate Roadmap with AI
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 px-6 py-4">
             {aiSuggestions.length === 0 ? (
                <div className="space-y-4">
                   <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <h4 className="font-semibold text-primary mb-1">How it works</h4>
                      <p className="text-sm text-muted-foreground">
                         Describe your product, project, or goal. The AI will generate a structured roadmap with "Now", "Next", and "Later" items, complete with priorities and tags.
                      </p>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-sm font-medium">What are you building?</label>
                      <Textarea 
                        placeholder="e.g. A marketplace for freelance designers with portfolio reviews and payment processing..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[120px] text-base"
                      />
                   </div>
                </div>
             ) : (
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="font-medium">Suggested Features</h3>
                      <div className="text-sm text-muted-foreground">
                         {selectedSuggestions.size} selected
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      {aiSuggestions.map((feature, idx) => (
                         <div 
                           key={idx} 
                           className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedSuggestions.has(idx) 
                                ? "bg-primary/5 border-primary/30" 
                                : "bg-card border-border hover:border-primary/20"
                           }`}
                           onClick={() => {
                              const next = new Set(selectedSuggestions);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              setSelectedSuggestions(next);
                           }}
                         >
                            <div className="flex items-start gap-3">
                               <Checkbox 
                                  checked={selectedSuggestions.has(idx)}
                                  onCheckedChange={() => {}} // Handled by parent div
                                  className="mt-1"
                               />
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="font-medium text-sm">{feature.title}</span>
                                     <Badge variant="secondary" className="text-[10px] h-5">
                                        {feature.status.toUpperCase()}
                                     </Badge>
                                     <Badge variant="outline" className="text-[10px] h-5">
                                        {feature.priority}
                                     </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          <div className="p-6 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-background z-10">
             {aiSuggestions.length === 0 ? (
                <>
                   <Button variant="ghost" onClick={() => setIsAIModalOpen(false)}>Cancel</Button>
                   <Button variant="hero" onClick={handleAIGenerate} disabled={aiLoading || !aiPrompt.trim()}>
                      {aiLoading ? (
                        <>
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           Generating...
                        </>
                      ) : (
                        <>
                           <Sparkles className="w-4 h-4 mr-2" />
                           Generate Plan
                        </>
                      )}
                   </Button>
                </>
             ) : (
                <>
                   <Button variant="ghost" onClick={() => {
                      setAiSuggestions([]);
                      setSelectedSuggestions(new Set());
                   }}>Back</Button>
                   <Button variant="hero" onClick={handleAcceptSuggestions} disabled={loading}>
                      {loading ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                         <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Selected to Roadmap
                         </>
                      )}
                   </Button>
                </>
             )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the feature
              "{featureToDelete?.title}" from your roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default RoadmapsPage;
