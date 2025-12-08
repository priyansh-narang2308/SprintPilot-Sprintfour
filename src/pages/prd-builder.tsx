/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Plus, Download, Copy as CopyIcon, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { supabase } from "../lib/supabase";
import { generateCompletePRD } from "../lib/geiminiApi";
import { marked } from "marked";
import { toast } from "sonner";

type PRD = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  created_at?: string | null;
};

const PRDBuilderPage: React.FC = () => {
  const [prds, setPrds] = useState<PRD[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<PRD | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PRD | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [extraContext, setExtraContext] = useState("");

  useEffect(() => {
    fetchPRDs();
    fetchWorkspaces();
  }, []);

  const [workspaces, setWorkspaces] = useState<
    Array<{ id: string; name: string }>
  >([]);
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

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id,name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWorkspaces((data as any) || []);
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  const selectWorkspace = (ws: { id: string; name: string } | null) => {
    setSelectedWorkspace(ws);
    if (ws) localStorage.setItem("current_workspace", JSON.stringify(ws));
    else localStorage.removeItem("current_workspace");
    // refetch PRDs scoped to the workspace
    fetchPRDs();
  };

  const createWorkspace = async () => {
    const name = window.prompt("New workspace name");
    if (!name) return;
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name })
        .select("id,name")
        .single();
      if (error) throw error;
      await fetchWorkspaces();
      selectWorkspace(data as { id: string; name: string });
    } catch (err) {
      console.error("Create workspace failed", err);
    }
  };

  const fetchPRDs = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("current_workspace");
      const workspace = stored ? JSON.parse(stored) : null;
      let query = supabase
        .from("prds")
        .select("id,title,description,content,created_at")
        .order("created_at", { ascending: false });
      if (workspace && workspace.id)
        query = query.eq("workspace_id", workspace.id);
      const { data, error } = await query;
      if (error) {
        if ((error as any)?.code === "42703") {
          let q2 = supabase
            .from("prds")
            .select("id,title,description,created_at")
            .order("created_at", { ascending: false });
          if (workspace && workspace.id)
            q2 = q2.eq("workspace_id", workspace.id);
          const { data: d2, error: e2 } = await q2;
          if (e2) throw e2;

          const mapped = ((d2 as any[]) || []).map((r) => ({
            ...r,
            content: null,
          }));
          setPrds(mapped as PRD[]);
        } else {
          throw error;
        }
      } else {
        setPrds((data as PRD[]) || []);
      }
    } catch (err) {
      console.error("Failed to fetch PRDs", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setProductName("");
    setProductDescription("");
    setAudience("");
    setGoals("");
    setExtraContext("");
    setModalOpen(true);
  };

  const openEditModal = (p: PRD) => {
    setEditId(p.id);
    setEditTitle(p.title || "");
    setEditDescription(p.description || "");
    setEditContent(p.content ?? "");
    setEditModalOpen(true);
  };

  const saveEditPRD = async () => {
    try {
      const workspaceRaw = localStorage.getItem("current_workspace");
      const workspace = workspaceRaw ? JSON.parse(workspaceRaw) : null;
      if (editId) {
        // update
        const payload: Record<string, unknown> = {
          title: editTitle,
          description: editDescription,
        };
        // only include content if we have it
        if (typeof editContent !== "undefined") payload.content = editContent;
        await supabase.from("prds").update(payload).eq("id", editId);
      } else {
        // insert new blank PRD
        const payload: Record<string, unknown> = {
          title: editTitle || "Untitled PRD",
          description: editDescription || null,
          content: editContent ?? "",
        };
        if (workspace && workspace.id) payload.workspace_id = workspace.id;
        await supabase.from("prds").insert(payload);
      }
      setEditModalOpen(false);
      await fetchPRDs();
    } catch (err) {
      console.error("Save PRD failed", err);
    }
  };

  const confirmDeletePRD = (p: PRD) => {
    setDeleteTarget(p);
    setShowDeleteDialog(true);
  };

  const deletePRD = async () => {
    if (!deleteTarget) return;
    try {
      await supabase.from("prds").delete().eq("id", deleteTarget.id);
      setShowDeleteDialog(false);
      if (selected?.id === deleteTarget.id) setSelected(null);
      await fetchPRDs();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete PRD failed", err);
    }
  };

  const generatePRD = async () => {
    const prompt = `Product Name: ${productName}\nDescription: ${productDescription}\nAudience: ${audience}\nGoals: ${goals}\nContext: ${extraContext}`;
    try {
      setGenerating(true);
      const md = await generateCompletePRD(prompt);
      const title =
        productName || (productDescription || "Generated PRD").slice(0, 40);
      const stored = localStorage.getItem("current_workspace");
      const workspace = stored ? JSON.parse(stored) : null;
      const insertPayload: Record<string, unknown> = {
        title,
        description: productDescription,
        content: md,
      };
      if (workspace && workspace.id) insertPayload.workspace_id = workspace.id;

      try {
        const { data, error } = await supabase
          .from("prds")
          .insert(insertPayload)
          .select("id,title,description,content,created_at")
          .single();
        if (error) throw error;
        setModalOpen(false);
        await fetchPRDs();
        setSelected(data as PRD);
      } catch (err: any) {
        console.warn(
          "Insert/select with content failed, retrying without content",
          err
        );
        if (err?.code === "42703") {
          const { data, error } = await supabase
            .from("prds")
            .insert(insertPayload)
            .select("id,title,description,created_at")
            .single();
          if (error) throw error;
          setModalOpen(false);
          await fetchPRDs();

          setSelected({
            id: (data as any).id,
            title: (data as any).title,
            description: (data as any).description,
            created_at: (data as any).created_at,
            content: md ?? null,
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Generation error", err);
    } finally {
      setGenerating(false);
    }
  };

  const openPRD = (p: PRD) => {
    setSelected(p);
  };

  const updatePRD = async (p: PRD) => {
    try {
      await supabase
        .from("prds")
        .update({
          title: p.title,
          description: p.description,
          content: p.content,
        })
        .eq("id", p.id);
      await fetchPRDs();
      setSelected(p);
    } catch (err) {
      if ((err as any)?.code === "42703") {
        try {
          await supabase
            .from("prds")
            .update({ title: p.title, description: p.description })
            .eq("id", p.id);
          await fetchPRDs();
          setSelected(p);
          console.warn(
            "Updated PRD without content column (content not persisted)"
          );
        } catch (e2) {
          console.error("Update PRD failed (no-content fallback)", e2);
        }
      } else {
        console.error("Update PRD failed", err);
      }
    }
  };

  const copyMarkdown = async () => {
    if (!selected?.content) return;
    await navigator.clipboard.writeText(selected.content);
  };

  const exportMarkdown = () => {
    if (!selected?.content) return;
    const blob = new Blob([selected.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(selected.title || "prd")
      .replace(/\s+/g, "-")
      .toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown Copied Successfully");
  };

  return (
    <DashboardLayout title="PRD Builder">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">PRD Builder</h1>
            <div className="mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {selectedWorkspace?.name || "Select workspace"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                  {workspaces.length === 0 ? (
                    <DropdownMenuItem onSelect={() => {}}>
                      No workspaces
                    </DropdownMenuItem>
                  ) : (
                    workspaces.map((w) => (
                      <DropdownMenuItem
                        key={w.id}
                        onSelect={() => selectWorkspace(w)}
                      >
                        {w.name}
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={createWorkspace}>
                    Create workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchPRDs}>
              Refresh
            </Button>

            <Button variant="hero" size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" /> New AI PRD
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <aside className="col-span-1 bg-card rounded-2xl p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your PRDs</h3>
              <span className="text-xs text-muted-foreground">
                {prds.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : prds.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No PRDs yet. Click New AI PRD to get started.
                </div>
              ) : (
                prds.map((p) => (
                  <div
                    key={p.id}
                    className="w-full flex items-start justify-between p-3 rounded-lg hover:bg-muted"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => openPRD(p)}
                    >
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {(p.description || "").slice(0, 80)}
                      </div>
                    </button>

                    <div className="flex items-center gap-2 ml-3">
                      <button
                        title="Edit"
                        className="p-2 rounded hover:bg-muted"
                        onClick={() => openEditModal(p)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        className="p-2 rounded hover:bg-red-50 text-destructive"
                        onClick={() => confirmDeletePRD(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-muted-foreground">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <main className="col-span-2 bg-card rounded-2xl p-4 border min-h-[60vh]">
            {selected ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <input
                      className="text-xl font-semibold w-full bg-transparent"
                      value={selected.title}
                      onChange={(e) =>
                        setSelected({ ...selected, title: e.target.value })
                      }
                    />
                    <input
                      className="text-sm w-full bg-transparent mt-1 text-muted-foreground"
                      value={selected.description || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyMarkdown}>
                      <CopyIcon className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportMarkdown}
                    >
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => updatePRD(selected)}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <textarea
                    className="w-full h-[60vh] p-3 border rounded"
                    value={selected.content || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, content: e.target.value })
                    }
                  />
                  <div className="prose max-h-[60vh] overflow-auto p-3">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(selected.content || ""),
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select or create a PRD to get started.
              </div>
            )}
          </main>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[720px] bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create PRD</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Short description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Primary audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Primary goals (comma separated)"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Extra context (optional)"
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={generatePRD}
                  disabled={generating}
                >
                  {generating ? "Generating..." : "Generate PRD"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit / Create PRD modal (blank or edit existing) */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit PRD" : "New PRD"}</DialogTitle>
              <DialogDescription>
                {editId
                  ? "Edit the PRD details and content."
                  : "Create a new blank PRD."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <input
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Short description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <textarea
                className="w-full p-2 border rounded h-40"
                placeholder="Content (markdown)"
                value={editContent ?? ""}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={saveEditPRD}>
                {editId ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete PRD</DialogTitle>
              <DialogDescription>
                This will permanently delete the PRD. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm">
                Are you sure you want to delete{" "}
                <strong>{deleteTarget?.title}</strong>?
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-destructive text-destructive-foreground"
                onClick={deletePRD}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PRDBuilderPage;
