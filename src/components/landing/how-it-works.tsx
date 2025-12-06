import { Lightbulb, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Describe Your Idea",
    description:
      "Tell us about your startup concept in a few sentences. Include your target audience, the problem you're solving, and your unique approach.",
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI Generates Blueprint",
    description:
      "Our AI analyzes your input and generates a complete startup blueprint including PRD, personas, journey maps, and initial wireframes.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Iterate & Launch",
    description:
      "Refine your blueprint with our collaborative tools. Export to your favorite platforms and start building with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
            Three Steps to Your Startup Blueprint
          </h2>
          <p className="text-lg text-muted-foreground">
            Go from idea to actionable plan in minutes, not weeks. Our
            AI-powered platform streamlines the entire product planning process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step) => (
            <div key={step.step} className="relative text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary text-primary text-sm font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
