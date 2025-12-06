import {
  Plus,
  Wand2,
  Download,
  Copy,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  AlignLeft,
  MoreHorizontal,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { useState } from "react";

const templates = [
  "Problem Statement",
  "Vision & Goals",
  "User Segments",
  "Functional Requirements",
  "Non-Functional Requirements",
  "Edge Cases & Risks",
];

const PRDBuilderPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [content, setContent] = useState(`## Problem Statement

### The Challenge
Modern startup founders spend weeks manually creating product documentation, user personas, and roadmaps. This time-consuming process often leads to:

- Delayed product launches
- Inconsistent documentation quality
- Missing critical user insights
- Poor stakeholder alignment

### Our Solution
SprintPilot automates the entire product planning process using AI, reducing weeks of work to minutes while maintaining professional quality and depth.

### Target Users
- Early-stage startup founders
- Product managers at growth companies
- Solo entrepreneurs
- Product consultants

### Key Metrics
| Metric | Current State | Target |
|--------|--------------|--------|
| Time to PRD | 2-3 weeks | < 30 minutes |
| Documentation completeness | 60% | 95% |
| Stakeholder alignment | Low | High |
`);

  return (
    <DashboardLayout title="PRD Builder">
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-64 shrink-0">
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Sections</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {templates.map((template) => (
                <button
                  key={template}
                  onClick={() => setActiveSection(template)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeSection === template
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">AI Generate</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Let AI write this section based on your product description
            </p>
            <Button variant="hero" size="sm" className="w-full">
              Generate Section
            </Button>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Bold className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-border mx-2" />
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Heading1 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-border mx-2" />
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <AlignLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none bg-transparent focus:outline-none text-sm leading-relaxed font-mono"
              placeholder="Start writing your PRD..."
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PRDBuilderPage;
