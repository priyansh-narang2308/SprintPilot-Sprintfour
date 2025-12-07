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
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";

const tools = [
  { icon: MousePointer, name: "Select" },
  { icon: Move, name: "Move" },
  { icon: Square, name: "Rectangle" },
  { icon: Circle, name: "Circle" },
  { icon: Type, name: "Text" },
  { icon: Image, name: "Image" },
  { icon: Minus, name: "Line" },
];

const mockElements = [
  {
    id: 1,
    type: "frame",
    x: 100,
    y: 80,
    width: 280,
    height: 500,
    label: "Mobile App",
  },
  {
    id: 2,
    type: "rect",
    x: 120,
    y: 100,
    width: 240,
    height: 50,
    label: "Header",
    color: "bg-primary/20",
  },
  {
    id: 3,
    type: "rect",
    x: 120,
    y: 170,
    width: 240,
    height: 120,
    label: "Hero Image",
    color: "bg-muted",
  },
  {
    id: 4,
    type: "rect",
    x: 120,
    y: 310,
    width: 100,
    height: 40,
    label: "CTA Button",
    color: "bg-primary/30",
  },
  {
    id: 5,
    type: "rect",
    x: 120,
    y: 370,
    width: 240,
    height: 60,
    label: "Feature 1",
    color: "bg-muted/50",
  },
  {
    id: 6,
    type: "rect",
    x: 120,
    y: 440,
    width: 240,
    height: 60,
    label: "Feature 2",
    color: "bg-muted/50",
  },
];

const WireframesPage = () => {
  const [activeTool, setActiveTool] = useState("Select");
  const [zoom, setZoom] = useState(100);

  return (
    <DashboardLayout title="Wireframes">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        <div className="w-14 bg-card rounded-2xl border border-border/50 p-2 flex flex-col items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setActiveTool(tool.name)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTool === tool.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              }`}
              title={tool.name}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex-1 bg-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-sm">Mobile App Wireframe</h3>
              <span className="text-xs text-muted-foreground">Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-1.5 rounded hover:bg-background transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-medium min-w-[50px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1.5 rounded hover:bg-background transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" size="sm">
                <Wand2 className="w-4 h-4" />
                Auto-generate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,hsl(var(--border)/0.3)_19px,hsl(var(--border)/0.3)_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,hsl(var(--border)/0.3)_19px,hsl(var(--border)/0.3)_20px)]">
            <div
              className="relative mx-auto"
              style={{
                width: 500 * (zoom / 100),
                height: 700 * (zoom / 100),
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
              }}
            >
              {mockElements.map((el) => (
                <div
                  key={el.id}
                  className={`absolute border-2 border-dashed ${
                    el.type === "frame" ? "border-primary/50" : "border-border"
                  } ${
                    el.color || ""
                  } rounded-lg flex items-center justify-center cursor-move hover:border-primary transition-colors`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                  }}
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    {el.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-56 bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Layers</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {mockElements.map((el) => (
              <div
                key={el.id}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer text-sm"
              >
                <Square className="w-3 h-3 text-muted-foreground" />
                <span className="truncate">{el.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WireframesPage;
