import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Lightbulb,
  Users,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const industries = [
  "SaaS",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "EdTech",
  "AI/ML",
  "Consumer Apps",
  "Marketplace",
  "Enterprise",
  "Other",
];

const roles = [
  "Solo Founder",
  "Co-founder",
  "Product Manager",
  "Designer",
  "Developer",
  "Marketing",
  "Investor",
  "Other",
];

const stages = [
  { value: "idea", label: "Just an idea", icon: Lightbulb },
  { value: "mvp", label: "Building MVP", icon: Rocket },
  { value: "launched", label: "Already launched", icon: Sparkles },
  { value: "scaling", label: "Scaling up", icon: Users },
];

import { generateBlueprintResponse } from "../lib/geiminiApi";
import { storage } from "../lib/storage";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [startupName, setStartupName] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Generate Blueprint
      const blueprint = await generateBlueprintResponse({
        name: startupName,
        industry,
        role,
        stage,
      });

      // Create Project Object
      const newProject = {
        id: Date.now(),
        name: startupName || "Untitled Project",
        description: `${industry} ${stage === "idea" ? "Concept" : "Startup"}`,
        progress: 10,
        lastEdited: "Just now",
        modules: ["Blueprint"],
        blueprintContent: blueprint,
      };

      // Save to storage
      storage.addProject(newProject);
      storage.logActivity("Created Blueprint", startupName);

      toast.success("Blueprint generated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to generate blueprint. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SprintPilot</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full gradient-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold mb-2">
                What's your startup called?
              </h1>
              <p className="text-muted-foreground mb-8">
                Give your project a name. You can always change this later.
              </p>
              <div className="space-y-2">
                <Label htmlFor="startupName">Startup name</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="startupName"
                    type="text"
                    placeholder="e.g., Acme Inc"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold mb-2">
                What industry are you in?
              </h1>
              <p className="text-muted-foreground mb-8">
                This helps us tailor your blueprint templates.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      industry === ind
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold mb-2">What's your role?</h1>
              <p className="text-muted-foreground mb-8">
                Help us personalize your experience.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      role === r
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold mb-2">
                What stage is your product?
              </h1>
              <p className="text-muted-foreground mb-8">
                We'll customize recommendations based on your stage.
              </p>
              <div className="space-y-3">
                {stages.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStage(s.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                      stage === s.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stage === s.value ? "gradient-primary" : "bg-muted"
                      }`}
                    >
                      <s.icon
                        className={`w-5 h-5 ${
                          stage === s.value
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                variant="hero"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !startupName) ||
                  (step === 2 && !industry) ||
                  (step === 3 && !role)
                }
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleComplete}
                disabled={!stage || isLoading}
              >
                {isLoading ? "Creating..." : "Create your first Blueprint"}
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
