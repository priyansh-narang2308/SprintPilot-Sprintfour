import {
  FileText,
  Users,
  GitBranch,
  Layout,
  Calendar,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "PRD Generator",
    description:
      "Create comprehensive Product Requirement Documents with AI-powered suggestions for features, user stories, and acceptance criteria.",
    color: "bg-purple-500",
  },
  {
    icon: Users,
    title: "Personas AI",
    description:
      "Generate detailed user personas based on your target market. Understand motivations, pain points, and behaviors instantly.",
    color: "bg-blue-500",
  },
  {
    icon: GitBranch,
    title: "Journey Mapping",
    description:
      "Visualize complete user journeys from awareness to advocacy. Identify touchpoints and optimize the customer experience.",
    color: "bg-pink-500",
  },
  {
    icon: Layout,
    title: "Wireframe Canvas",
    description:
      "Design low-fidelity wireframes with drag-and-drop simplicity. Auto-generate UI from your PRD requirements.",
    color: "bg-amber-500",
  },
  {
    icon: Calendar,
    title: "Product Roadmaps",
    description:
      "Create beautiful Now/Next/Later roadmaps. Prioritize features and communicate your vision to stakeholders.",
    color: "bg-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Competitive Analysis",
    description:
      "Analyze competitors with AI-powered SWOT analysis. Understand market positioning and identify opportunities.",
    color: "bg-primary",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-15 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
            Everything You Need to Launch Faster
          </h2>
          <p className="text-lg text-muted-foreground">
            From initial concept to development-ready specs, SprintPilot
            provides all the tools founders need to validate and document their
            startup ideas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-6 border border-border/50 hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
              >
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
