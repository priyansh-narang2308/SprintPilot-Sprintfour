/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Wand2,
  Download,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Square,
  Circle,
  Type,
  Image,
  Minus,
  Move,
  Layers,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  generateWireframeFromPRD,
  type WireframeElement,
  type WireframeContent,
} from "../lib/geiminiApi";
import { toast } from "sonner";

type PRD = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  created_at?: string | null;
};

type Wireframe = {
  id: string;
  workspace_id: string;
  prd_id: string | null;
  title: string;
  description: string | null;
  content: WireframeContent;
  status: string;
  created_at?: string;
  updated_at?: string;
};

const tools = [
  { icon: MousePointer, name: "Select", id: "select" },
  { icon: Move, name: "Move", id: "move" },
  { icon: Square, name: "Rectangle", id: "rect" },
  { icon: Circle, name: "Circle", id: "circle" },
  { icon: Type, name: "Text", id: "text" },
  { icon: Image, name: "Image", id: "image" },
  { icon: Minus, name: "Line", id: "line" },
];

const colorOptions = [
  { name: "White", value: "bg-white" },
  { name: "Primary/20", value: "bg-primary/20" },
  { name: "Blue/100", value: "bg-blue-100" },
  { name: "Gray/100", value: "bg-gray-100" },
  { name: "Primary/30", value: "bg-primary/30" },
  { name: "Muted", value: "bg-muted" },
  { name: "Muted/50", value: "bg-muted/50" },
];

const WireframesPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [zoom, setZoom] = useState(100);
  const [prds, setPrds] = useState<PRD[]>([]);
  const [wireframes, setWireframes] = useState<Wireframe[]>([]);
  const [selectedPRD, setSelectedPRD] = useState<string>("");
  const [selectedWireframe, setSelectedWireframe] = useState<Wireframe | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newWireframeModal, setNewWireframeModal] = useState(false);
  const [editingElement, setEditingElement] = useState<WireframeElement | null>(
    null
  );
  const [editElementModal, setEditElementModal] = useState(false);
  const [wireframeTitle, setWireframeTitle] = useState("");
  const [wireframeDescription, setWireframeDescription] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("current_workspace");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingElement, setDraggingElement] =
    useState<WireframeElement | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("current_workspace");
      const workspace = stored ? JSON.parse(stored) : null;

      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      // Fetch PRDs
      const { data: prdData, error: prdError } = await supabase
        .from("prds")
        .select("id,title,description,content,created_at")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (!prdError) {
        setPrds((prdData as PRD[]) || []);
      }

      const { data: wireframeData, error: wireframeError } = await supabase
        .from("wireframes")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (!wireframeError) {
        const parsedWireframes = (wireframeData || []).map((wf: any) => ({
          ...wf,
          content:
            typeof wf.content === "string"
              ? JSON.parse(wf.content)
              : wf.content,
        }));
        setWireframes(parsedWireframes);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWireframe = async () => {
    if (!selectedPRD) {
      toast.error("Please select a PRD first");
      return;
    }

    const prd = prds.find((p) => p.id === selectedPRD);
    if (!prd || !prd.content) {
      toast.error("Selected PRD has no content");
      return;
    }

    try {
      setGenerating(true);
      const wireframeContent = await generateWireframeFromPRD(
        prd.content,
        prd.title
      );
      setSelectedWireframe({
        id: "",
        workspace_id: selectedWorkspace?.id || "",
        prd_id: selectedPRD,
        title: `${prd.title} - Wireframe`,
        description: prd.description,
        content: wireframeContent,
        status: "draft",
      });
      setWireframeTitle(`${prd.title} - Wireframe`);
      setWireframeDescription(prd.description || "");
      toast.success("Wireframe generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate wireframe. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveWireframe = async () => {
    if (!selectedWireframe) return;

    try {
      const workspace = selectedWorkspace;
      if (!workspace?.id) {
        toast.error("No workspace selected");
        return;
      }

      const payload = {
        workspace_id: workspace.id,
        prd_id: selectedWireframe.prd_id || null,
        title: wireframeTitle || "Untitled Wireframe",
        description: wireframeDescription || null,
        content: selectedWireframe.content,
        status: selectedWireframe.status,
      };

      if (selectedWireframe.id) {
        await supabase
          .from("wireframes")
          .update(payload)
          .eq("id", selectedWireframe.id);
        toast.success("Wireframe updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("wireframes")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        selectedWireframe.id = (data as any).id;
        toast.success("Wireframe saved successfully!");
      }

      await fetchData();
      setNewWireframeModal(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save wireframe");
    }
  };

  const deleteWireframe = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wireframe?")) return;

    try {
      await supabase.from("wireframes").delete().eq("id", id);
      if (selectedWireframe?.id === id) setSelectedWireframe(null);
      await fetchData();
      toast.success("Wireframe deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete wireframe");
    }
  };

  const addElement = () => {
    if (!selectedWireframe) return;

    const newElement: WireframeElement = {
      id: `element-${Date.now()}`,
      type: (activeTool as any) || "rect",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      label: "New Element",
      color: "bg-muted",
    };

    setSelectedWireframe({
      ...selectedWireframe,
      content: {
        ...selectedWireframe.content,
        elements: [...selectedWireframe.content.elements, newElement],
      },
    });
  };

  const updateElement = (id: string, updates: Partial<WireframeElement>) => {
    if (!selectedWireframe) return;

    setSelectedWireframe({
      ...selectedWireframe,
      content: {
        ...selectedWireframe.content,
        elements: selectedWireframe.content.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      },
    });
  };

  const deleteElement = (id: string) => {
    if (!selectedWireframe) return;

    setSelectedWireframe({
      ...selectedWireframe,
      content: {
        ...selectedWireframe.content,
        elements: selectedWireframe.content.elements.filter(
          (el) => el.id !== id
        ),
      },
    });
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: WireframeElement
  ) => {
    if (activeTool !== "move") return;
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingElement(element);
    setDragOffset({
      x: e.clientX - rect.left - element.x * (zoom / 100),
      y: e.clientY - rect.top - element.y * (zoom / 100),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || activeTool !== "move") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(
      0,
      (e.clientX - rect.left - dragOffset.x) / (zoom / 100)
    );
    const newY = Math.max(
      0,
      (e.clientY - rect.top - dragOffset.y) / (zoom / 100)
    );

    updateElement(draggingElement.id, { x: newX, y: newY });
    setDraggingElement({ ...draggingElement, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  const exportAsImage = async () => {
    if (!selectedWireframe) return;
    toast.info("Export feature coming soon!");
  };

  return (
    <DashboardLayout title="Wireframes">
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-card rounded-2xl border p-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Wireframes</h1>
            <p className="text-sm text-muted-foreground">
              {selectedWireframe
                ? selectedWireframe.title
                : "Select or create a wireframe"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchData}>
              Refresh
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => setNewWireframeModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> New Wireframe
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 flex-1 min-h-0 flex-col md:flex-row">
          {/* Left Sidebar - Tools */}
          <div className="w-full md:w-14 bg-card rounded-2xl border p-2 flex md:flex-col items-center gap-1 overflow-x-auto md:overflow-y-auto">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  activeTool === tool.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                title={tool.name}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="flex-1 bg-card rounded-2xl border flex flex-col overflow-hidden min-w-0">
            {selectedWireframe ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {selectedWireframe.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {selectedWireframe.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setZoom(Math.max(50, zoom - 25))}
                        className="p-1.5 rounded hover:bg-background transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="px-2 text-sm font-medium min-w-[50px] text-center">
                        {zoom}%
                      </span>
                      <button
                        onClick={() => setZoom(Math.min(200, zoom + 25))}
                        className="p-1.5 rounded hover:bg-background transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <Button variant="outline" size="sm" onClick={exportAsImage}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="hero" size="sm" onClick={saveWireframe}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                </div>

                <div
                  ref={canvasRef}
                  className="flex-1 overflow-auto p-8 bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,hsl(var(--border)/0.3)_19px,hsl(var(--border)/0.3)_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,hsl(var(--border)/0.3)_19px,hsl(var(--border)/0.3)_20px)] cursor-move"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="relative mx-auto bg-white rounded-lg shadow-lg"
                    style={{
                      width: 1280 * (zoom / 100),
                      height: 800 * (zoom / 100),
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {selectedWireframe.content.elements.map((el) => (
                      <div
                        key={el.id}
                        className={`absolute border-2 border-dashed border-border ${el.color} rounded-lg flex items-center justify-center cursor-pointer group hover:border-primary transition-colors`}
                        style={{
                          left: el.x,
                          top: el.y,
                          width: el.width,
                          height: el.height,
                          opacity: el.opacity || 1,
                        }}
                        onMouseDown={(e) => handleElementMouseDown(e, el)}
                        onClick={() => {
                          setEditingElement(el);
                          setEditElementModal(true);
                        }}
                      >
                        <span className="text-xs text-muted-foreground font-medium px-2 text-center">
                          {el.label}
                        </span>
                        <button
                          className="absolute -top-6 -right-6 p-1 rounded bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(el.id);
                          }}
                          title="Delete"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">
                    No wireframe selected
                  </p>
                  <p className="text-sm mb-4">
                    Select a wireframe from the list or create a new one
                  </p>
                  <Button
                    variant="hero"
                    onClick={() => setNewWireframeModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Wireframe
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-56 bg-card rounded-2xl border p-4 overflow-y-auto flex flex-col">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <h3 className="font-semibold text-sm">Layers</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={addElement}
                  title="Add Element"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {selectedWireframe &&
              selectedWireframe.content.elements.length > 0 ? (
                <div className="space-y-1">
                  {selectedWireframe.content.elements.map((el) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer text-sm group"
                      onClick={() => {
                        setEditingElement(el);
                        setEditElementModal(true);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Square className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{el.label}</span>
                      </div>
                      <button
                        className="p-1 rounded hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No elements yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-4 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Wireframes</h3>
            <span className="text-xs text-muted-foreground">
              {wireframes.length}
            </span>
          </div>
          {wireframes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {wireframes.map((wf) => (
                <div key={wf.id} className="relative">
                  <button
                    onClick={() => setSelectedWireframe(wf)}
                    className={`w-full p-2 rounded-lg border transition-colors text-left ${
                      selectedWireframe?.id === wf.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted hover:bg-muted/80 border-border"
                    }`}
                  >
                    <p className="text-xs font-medium truncate">{wf.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {wf.content.elements.length} elements
                    </p>
                  </button>
                  <button
                    onClick={() => deleteWireframe(wf.id)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No wireframes yet</p>
          )}
        </div>
      </div>

      <Dialog open={newWireframeModal} onOpenChange={setNewWireframeModal}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWireframe && selectedWireframe.id
                ? "Edit Wireframe"
                : "Create New Wireframe"}
            </DialogTitle>
            <DialogDescription>
              Generate a wireframe from a PRD or create a blank one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Wireframe Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Mobile App Wireframe"
                value={wireframeTitle}
                onChange={(e) => setWireframeTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Add a description for this wireframe"
                rows={2}
                value={wireframeDescription}
                onChange={(e) => setWireframeDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select PRD (Optional)
              </label>
              <Select value={selectedPRD} onValueChange={setSelectedPRD}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a PRD to generate wireframe from..." />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {prds.length > 0 ? (
                    prds.map((prd) => (
                      <SelectItem key={prd.id} value={prd.id}>
                        <div className="flex flex-col">
                          <span>{prd.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {(prd.description || "").slice(0, 50)}...
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No PRDs available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPRD && (
              <Button
                variant="hero"
                onClick={handleGenerateWireframe}
                disabled={generating}
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {generating ? "Generating..." : "Generate Wireframe from PRD"}
              </Button>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveWireframe} disabled={!wireframeTitle}>
              {selectedWireframe && selectedWireframe.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editElementModal} onOpenChange={setEditElementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Element</DialogTitle>
          </DialogHeader>

          {editingElement && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Label</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editingElement.label}
                  onChange={(e) =>
                    setEditingElement({
                      ...editingElement,
                      label: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    X Position
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={editingElement.x}
                    onChange={(e) =>
                      setEditingElement({
                        ...editingElement,
                        x: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Y Position
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={editingElement.y}
                    onChange={(e) =>
                      setEditingElement({
                        ...editingElement,
                        y: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Width
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={editingElement.width}
                    onChange={(e) =>
                      setEditingElement({
                        ...editingElement,
                        width: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Height
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={editingElement.height}
                    onChange={(e) =>
                      setEditingElement({
                        ...editingElement,
                        height: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editingElement.color || "bg-muted"}
                  onChange={(e) =>
                    setEditingElement({
                      ...editingElement,
                      color: e.target.value,
                    })
                  }
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  value={editingElement.opacity || 1}
                  onChange={(e) =>
                    setEditingElement({
                      ...editingElement,
                      opacity: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (editingElement) {
                  updateElement(editingElement.id, editingElement);
                }
                setEditElementModal(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WireframesPage;
