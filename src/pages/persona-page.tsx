import {
  Plus,
  Wand2,
  Edit2,
  Trash2,
  Target,
  Heart,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { generatePersonaWithAI } from "../lib/ai-persona";

type Persona = {
  id: number;
  name: string;
  role: string;
  age: number;
  avatar: string;
  bio: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  behaviors: string[];
  created_at?: string | null;
};

const initialPersonas: Persona[] = [];

const PersonasPage = () => {
  const [personas, setPersonas] = useState(initialPersonas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState<number | null>(null);

  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [frustrations, setFrustrations] = useState("");
  const [motivations, setMotivations] = useState("");
  const [behaviors, setBehaviors] = useState("");

  const resetForm = () => {
    setName("");
    setRole("");
    setAge("");
    setBio("");
    setGoals("");
    setFrustrations("");
    setMotivations("");
    setBehaviors("");
  };

  const handleCreatePersona = () => {
    (async () => {
      if (!name.trim() || !role.trim()) {
        toast.error("Please provide at least a name and role");
        return;
      }

      const payload = {
        name: name.trim(),
        role: role.trim(),
        age: typeof age === "number" ? age : age ? Number(age) : 0,
        avatar: name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        bio: bio.trim(),
        goals: goals
          .split(/,|\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        frustrations: frustrations
          .split(/,|\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        motivations: motivations
          .split(/,|\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        behaviors: behaviors
          .split(/,|\n/)
          .map((s) => s.trim())
          .filter(Boolean),
      };

      try {
        if (editingPersonaId) {
          const { data, error } = await supabase
            .from("personas")
            .update(payload)
            .eq("id", editingPersonaId)
            .select()
            .single();
          if (error) throw error;
          setPersonas((p) =>
            p.map((per) => (per.id === editingPersonaId ? data : per))
          );
          toast.success("Persona updated");
        } else {
          const { data, error } = await supabase
            .from("personas")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          setPersonas((p) => [data, ...p]);
          toast.success("Persona created");
        }
        resetForm();
        setEditingPersonaId(null);
        setIsDialogOpen(false);
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "Failed to save persona");
      }
    })();
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<null | {
    id: number;
    name?: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPersonas((data ?? []) as Persona[]);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to load personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleDeletePersona = (id: number, name?: string) => {
    setDeleteCandidate({ id, name });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteCandidate) return;
    const id = deleteCandidate.id;
    try {
      const { error } = await supabase.from("personas").delete().eq("id", id);
      if (error) throw error;
      setPersonas((p) => p.filter((x) => x.id !== id));
      toast.success("Persona deleted");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to delete persona");
    } finally {
      setIsDeleteOpen(false);
      setDeleteCandidate(null);
    }
  };

  const openEditDialog = (persona: Persona) => {
    setEditingPersonaId(persona.id ?? null);
    setName(persona.name || "");
    setRole(persona.role || "");
    setAge(persona.age || "");
    setBio(persona.bio || "");
    setGoals((persona.goals || []).join("\n"));
    setFrustrations((persona.frustrations || []).join("\n"));
    setMotivations((persona.motivations || []).join("\n"));
    setBehaviors((persona.behaviors || []).join("\n"));
    setIsDialogOpen(true);
  };

  const handleGenerateAIPersona = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please provide a product description");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedPersona = await generatePersonaWithAI(aiPrompt);

      setName(generatedPersona.name);
      setRole(generatedPersona.role);
      setAge(generatedPersona.age);
      setBio(generatedPersona.bio);
      setGoals(generatedPersona.goals.join("\n"));
      setFrustrations(generatedPersona.frustrations.join("\n"));
      setMotivations(generatedPersona.motivations.join("\n"));
      setBehaviors(generatedPersona.behaviors.join("\n"));

      setIsAIDialogOpen(false);
      setAIPrompt("");
      setIsDialogOpen(true);
      setEditingPersonaId(null);

      toast.success("Persona generated! Review and save when ready.");
    } catch (error: unknown) {
      console.error("AI generation error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to generate persona";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout title="User Personas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Personas</h1>
            <p className="text-muted-foreground">
              Create and manage your target user profiles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAIDialogOpen(true)}
              disabled={isGenerating}
            >
              <Wand2 className="w-4 h-4" />
              AI Generate
            </Button>

            <Button
              variant="hero"
              onClick={() => {
                resetForm();
                setEditingPersonaId(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create Persona
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new persona</DialogTitle>
                  <DialogDescription>
                    Add a new user persona. Provide a name, role, and a short
                    bio. Use commas or newlines for list fields.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">Full name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyansh Narang"
                      />
                    </div>

                    <div>
                      <label className="text-sm">Role</label>
                      <Input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Product Manager"
                      />
                    </div>

                    <div>
                      <label className="text-sm">Age</label>
                      <Input
                        value={age?.toString() || ""}
                        onChange={(e) =>
                          setAge(e.target.value ? Number(e.target.value) : "")
                        }
                        type="number"
                        placeholder="e.g. 32"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-sm">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Short bio"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">
                        Goals (comma or newline separated)
                      </label>
                      <Textarea
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="Launch MVP, Secure funding"
                      />
                    </div>

                    <div>
                      <label className="text-sm">
                        Frustrations (comma or newline separated)
                      </label>
                      <Textarea
                        value={frustrations}
                        onChange={(e) => setFrustrations(e.target.value)}
                        placeholder="Scattered feedback, Manual docs"
                      />
                    </div>

                    <div>
                      <label className="text-sm">
                        Motivations (comma or newline separated)
                      </label>
                      <Textarea
                        value={motivations}
                        onChange={(e) => setMotivations(e.target.value)}
                        placeholder="Create value, Career growth"
                      />
                    </div>

                    <div>
                      <label className="text-sm">
                        Behaviors (comma or newline separated)
                      </label>
                      <Textarea
                        value={behaviors}
                        onChange={(e) => setBehaviors(e.target.value)}
                        placeholder="Uses Notion, Attends meetups"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <button className="px-3 py-2 rounded-md bg-muted/60 hover:bg-muted">
                      Cancel
                    </button>
                  </DialogClose>
                  <DialogClose asChild>
                    <button
                      onClick={() => {
                        handleCreatePersona();
                      }}
                      className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                    >
                      {editingPersonaId ? "Save" : "Create"}
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Persona with AI</DialogTitle>
                  <DialogDescription>
                    Describe your product or service, and AI will create a
                    detailed user persona for you.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <div>
                    <label className="text-sm font-medium">
                      Product/Service Description
                    </label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAIPrompt(e.target.value)}
                      placeholder="e.g., A project management tool for distributed teams to collaborate on tasks and track progress in real-time"
                      rows={5}
                      disabled={isGenerating}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The more detailed your description, the better the generated
                    persona will be.
                  </p>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <button
                      className="px-3 py-2 rounded-md bg-muted/60 hover:bg-muted"
                      disabled={isGenerating}
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    onClick={handleGenerateAIPersona}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? "Generating..." : "Generate Persona"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete persona</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {deleteCandidate?.name ?? "this persona"}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirmed}
                className="bg-destructive"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading personas...</p>
          </div>
        ) : personas.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4 border border-dashed rounded-lg">
            <p className="text-lg font-medium">No personas yet</p>
            <p className="text-sm text-muted-foreground max-w-xl">
              Create your first persona to get started.
            </p>
            <div>
              <Button
                variant="hero"
                onClick={() => {
                  resetForm();
                  setEditingPersonaId(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create persona
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden hover-lift group"
              >
                <div className="gradient-primary p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {persona.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-foreground">
                          {persona.name}
                        </h3>
                        <p className="text-primary-foreground/80 text-sm">
                          {persona.role}
                        </p>
                        <p className="text-primary-foreground/60 text-xs mt-1">
                          {persona.age} years old
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditDialog(persona)}
                        className="p-3 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                        aria-label={`Edit ${persona.name}`}
                      >
                        <Edit2 className="w-5 h-5 text-primary-foreground" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeletePersona(persona.id, persona.name)
                        }
                        className="p-3 rounded-lg bg-primary-foreground/20 hover:bg-destructive/80 transition-colors"
                        aria-label={`Delete ${persona.name}`}
                      >
                        <Trash2 className="w-5 h-5 text-primary-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-sm text-muted-foreground">{persona.bio}</p>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Target className="w-4 h-4 text-chart-4" />
                      Goals
                    </div>
                    <ul className="space-y-1">
                      {persona.goals.map((goal, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-chart-4 mt-1.5 shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Frustrations
                    </div>
                    <ul className="space-y-1">
                      {persona.frustrations.map((frustration, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                          {frustration}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Heart className="w-4 h-4 text-chart-5" />
                      Motivations
                    </div>
                    <ul className="space-y-1">
                      {persona.motivations.map((motivation, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                          {motivation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PersonasPage;
