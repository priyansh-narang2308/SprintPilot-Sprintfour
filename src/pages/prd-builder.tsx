import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { Plus, Download, Copy as CopyIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { generateCompletePRD } from "../lib/geiminiApi";
import { marked } from "marked";

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

  // form fields for AI inputs
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [extraContext, setExtraContext] = useState("");

  useEffect(() => {
    fetchPRDs();
  }, []);

  const fetchPRDs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prds")
        .select("id,title,description,content,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPrds((data as PRD[]) || []);
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

  const generatePRD = async () => {
    const prompt = `Product Name: ${productName}\nDescription: ${productDescription}\nAudience: ${audience}\nGoals: ${goals}\nContext: ${extraContext}`;
    try {
      setGenerating(true);
      const md = await generateCompletePRD(prompt);
      const title =
        productName || (productDescription || "Generated PRD").slice(0, 40);
      const { data, error } = await supabase
        .from("prds")
        .insert({ title, description: productDescription, content: md })
        .select("id,title,description,content,created_at")
        .single();
      if (error) throw error;
      setModalOpen(false);
      await fetchPRDs();
      setSelected(data as PRD);
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
      console.error("Update PRD failed", err);
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
  };

  return (
    <DashboardLayout title="PRD Builder">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">PRD Builder</h1>
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
                  <button
                    key={p.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted flex justify-between"
                    onClick={() => openPRD(p)}
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {(p.description || "").slice(0, 80)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString()
                        : ""}
                    </div>
                  </button>
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
                <h3 className="text-lg font-semibold">Create PRD (AI)</h3>
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
      </div>
    </DashboardLayout>
  );
};

export default PRDBuilderPage;
