import {
  Plus,
  Wand2,
  Download,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";

const competitors = [
  {
    name: "Linear",
    logo: "L",
    description: "Issue tracking for software teams",
    pricing: "$8/user/mo",
    strengths: ["Beautiful UI", "Fast performance", "Keyboard shortcuts"],
    weaknesses: [
      "Limited customization",
      "No free tier for teams",
      "Limited reporting",
    ],
  },
  {
    name: "Notion",
    logo: "N",
    description: "All-in-one workspace",
    pricing: "$10/user/mo",
    strengths: ["Flexible structure", "Great documentation", "Many templates"],
    weaknesses: [
      "Can be slow",
      "Steep learning curve",
      "Complex for simple use cases",
    ],
  },
  {
    name: "Productboard",
    logo: "P",
    description: "Product management platform",
    pricing: "$20/user/mo",
    strengths: ["Customer insights", "Roadmap views", "Integrations"],
    weaknesses: ["Expensive", "Complex setup", "Overkill for small teams"],
  },
];

const swotAnalysis = {
  strengths: [
    "AI-powered automation saves significant time",
    "All-in-one solution for product planning",
    "Beautiful, modern user interface",
    "Easy onboarding and learning curve",
  ],
  weaknesses: [
    "New entrant with limited brand recognition",
    "Dependent on AI quality and accuracy",
    "Limited integration ecosystem initially",
  ],
  opportunities: [
    "Growing demand for AI-powered tools",
    "Remote work driving documentation needs",
    "Underserved solo founder segment",
    "Potential for vertical-specific solutions",
  ],
  threats: [
    "Established competitors adding AI features",
    "Economic downturn reducing startup funding",
    "AI regulation and compliance requirements",
  ],
};

const CompetitiveAnalysisPage = () => {
  return (
    <DashboardLayout title="Competitive Analysis">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Competitive Analysis</h1>
            <p className="text-muted-foreground">
              Understand your market position
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="outline">
              <Wand2 className="w-4 h-4" />
              AI Analysis
            </Button>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              Add Competitor
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-semibold text-sm">
                    Competitor
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Pricing
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Strengths
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Weaknesses
                  </th>
                  <th className="text-left p-4 font-semibold text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor) => (
                  <tr
                    key={competitor.name}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-semibold">
                          {competitor.logo}
                        </div>
                        <div>
                          <p className="font-medium">{competitor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {competitor.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{competitor.pricing}</span>
                    </td>
                    <td className="p-4">
                      <ul className="space-y-1">
                        {competitor.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <TrendingUp className="w-3 h-3 text-chart-4" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <TrendingDown className="w-3 h-3 text-destructive" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">SWOT Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-chart-4/10 rounded-2xl border border-chart-4/30 p-5">
              <h3 className="font-semibold text-chart-4 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.strengths.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-4 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-destructive/10 rounded-2xl border border-destructive/30 p-5">
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Weaknesses
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-chart-3/10 rounded-2xl border border-chart-3/30 p-5">
              <h3 className="font-semibold text-chart-3 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.opportunities.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-3 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-chart-5/10 rounded-2xl border border-chart-5/30 p-5">
              <h3 className="font-semibold text-chart-5 mb-3 flex items-center gap-2">
                <Minus className="w-4 h-4" />
                Threats
              </h3>
              <ul className="space-y-2">
                {swotAnalysis.threats.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompetitiveAnalysisPage;
