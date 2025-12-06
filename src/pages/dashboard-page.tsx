import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  TrendingUp,
  FileText,
  Users,
  MoreHorizontal,
  Clock,
  Send,
  Bot,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { generateBlueprintResponse } from "../lib/geiminiApi";

const projects = [
  {
    id: 1,
    name: "Acme SaaS Platform",
    description: "B2B project management tool",
    progress: 75,
    lastEdited: "2 hours ago",
    modules: ["PRD", "Personas", "Roadmap"],
  },
  {
    id: 2,
    name: "FitTrack Mobile App",
    description: "Consumer fitness tracking app",
    progress: 40,
    lastEdited: "1 day ago",
    modules: ["PRD", "Journey Map"],
  },
  {
    id: 3,
    name: "EduLearn Marketplace",
    description: "Online course marketplace",
    progress: 90,
    lastEdited: "3 days ago",
    modules: ["PRD", "Personas", "Wireframes", "Roadmap"],
  },
];

const insights = [
  {
    icon: TrendingUp,
    title: "3 PRDs completed this week",
    description: "You're 50% more productive than last week",
    color: "bg-chart-4",
  },
  {
    icon: Users,
    title: "12 personas generated",
    description: "Across all your projects",
    color: "bg-chart-2",
  },
  {
    icon: FileText,
    title: "New template available",
    description: "AI-powered competitive analysis",
    color: "bg-chart-1",
  },
];

const recentActivity = [
  { action: "Updated PRD", project: "Acme SaaS Platform", time: "2 hours ago" },
  {
    action: "Created persona",
    project: "FitTrack Mobile App",
    time: "5 hours ago",
  },
  {
    action: "Generated roadmap",
    project: "EduLearn Marketplace",
    time: "1 day ago",
  },
  {
    action: "Exported to Jira",
    project: "Acme SaaS Platform",
    time: "2 days ago",
  },
];

const initialMessages: {
  id: number;
  text: string;
  sender: "ai" | "user";
  timestamp: Date;
}[] = [
  {
    id: 1,
    text: "Hello! I'm your AI assistant. I can help you generate comprehensive project blueprints. Try asking for a project roadmap or persona generation!",
    sender: "ai",
    timestamp: new Date(),
  },
];

const suggestions = [
  "Create a SaaS MVP Blueprint",
  "Generate User Personas for E-commerce",
  "Outline a Fitness App Roadmap",
  "Technical Stack for Social Network",
];

const Dashboard = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: number;
      text: string;
      sender: "ai" | "user";
      timestamp: Date;
    }[]
  >(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];

  useEffect(() => {
    if (messagesEndRef.current && isChatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const responseText = await generateBlueprintResponse(messageText);

      const aiMessage = {
        id: messages.length + 2, // Ideally use uuid or safer increment
        text: responseText || "I couldn't generate a response. Please try again.",
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get response", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, something went wrong. Please check your connection or API key.",
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your projects
            </p>
          </div>

          <Button variant="hero" asChild>
            <Link to="/dashboard/new">
              <Plus className="w-4 h-4" />
              New Blueprint
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-5 border border-border/50 hover-lift cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl ${insight.color} flex items-center justify-center`}
                >
                  <insight.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Projects</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-card rounded-2xl p-5 border border-border/50 hover-lift cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {project.description}
                      </p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {project.modules.map((module) => (
                      <span
                        key={module}
                        className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{project.lastEdited}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.project}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
            aria-label="Open AI Assistant"
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-ping" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <DialogTitle className="text-base">AI Assistant</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}
                    
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-3 bg-muted text-foreground rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Suggestions */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-xs font-medium text-primary transition-colors border border-primary/10 flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about features, templates, or help..."
                  className="w-full pl-4 pr-10 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
