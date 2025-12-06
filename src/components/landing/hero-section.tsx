import { ArrowRight, Play, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "../ui/button";
import heroDashboard from "@/assets/hero-dashboard.png";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-28 overflow-hidden bg-white">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        )}
      />

      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/10 blur-[140px]" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 animate-fade-up cursor-pointer">
            <Sparkles className="w-4 h-4" />
            AI-Powered Blueprint Generator
          </Badge>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            From Idea to{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Complete Blueprint
            </span>{" "}
            in Seconds
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Generate PRDs, personas, journeys, wireframes, and roadmaps
            instantly. Everything you need to turn your idea into an actionable
            startup blueprint.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button size="xl" variant="hero" asChild>
              <Link to="/signup">
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button size="xl" variant="glass" asChild>
              <a href="#demo">
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </Button>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Start instantly
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Privacy-first
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              High performance
            </div>
          </div>
        </div>

        <div
          className="mt-20 relative animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-gradient-to-b from-transparent to-white pointer-events-none" />

            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <img
                src={heroDashboard}
                alt="SprintPilot Dashboard showing AI-generated startup blueprints"
                className="w-full h-auto"
              />
            </div>

            <div className="absolute -left-8 top-1/4 glass-card rounded-2xl p-4 animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Generated</p>
                  <p className="text-xs text-muted-foreground">PRD Complete</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-8 top-1/3 glass-card rounded-2xl p-4 animate-float hidden lg:block"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-3 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">5 Personas</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
