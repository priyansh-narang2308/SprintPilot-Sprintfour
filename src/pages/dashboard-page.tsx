import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Sparkles,
  TrendingUp,
  FileText,
  Users,
  MoreHorizontal,
  Clock,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

const initialMessages = [
  {
    id: 1,
    text: "Hello! I'm your AI assistant. How can I help you with your blueprints today?",
    sender: "ai",
    timestamp: new Date(),
  },
  {
    id: 2,
    text: "I can help you with:\n• Writing user stories\n• Suggesting features\n• Competitive analysis\n• Persona generation\n• PRD templates",
    sender: "ai",
    timestamp: new Date(),
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];

  useEffect(() => {
    if (messagesEndRef.current && isChatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node) &&
        isChatOpen &&
        isChatMinimized
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen, isChatMinimized]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user" as const,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponses = [
        "I can help you with that! Based on your project needs, I suggest starting with a competitive analysis template to identify market gaps.",
        "For that feature, I recommend breaking it down into user stories. Would you like me to generate some examples?",
        "That's a great question! I can analyze your project requirements and suggest the best templates to use. Would you like me to proceed?",
        "Based on your recent activity, I notice you've been working on personas. Would you like me to generate more detailed demographic data?",
        "I can help optimize your PRD structure. Let me suggest some improvements based on industry best practices.",
      ];

      const aiMessage = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsChatMinimized(false);
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

      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6 text-primary-foreground" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-ping" />
          </div>
        </button>
      )}

      {isChatOpen && (
        <div
          ref={chatContainerRef}
          className={`fixed ${
            isChatMinimized
              ? "bottom-6 right-6 w-80 h-16"
              : "bottom-6 right-6 w-96 h-[600px]"
          } bg-card rounded-2xl border border-border shadow-2xl transition-all duration-300 z-50 flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {isChatMinimized ? "Click to expand" : "Ask me anything"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label={isChatMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isChatMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isChatMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
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

              <div className="p-4 border-t border-border/50">
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
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const quickQuestions = [
                        "Help me write user stories",
                        "Suggest features for my SaaS",
                        "Create a competitive analysis",
                        "Generate persona templates",
                      ];
                      const randomQuestion =
                        quickQuestions[
                          Math.floor(Math.random() * quickQuestions.length)
                        ];
                      setInputValue(randomQuestion);
                    }}
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                    aria-label="Quick suggestion"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </>
          )}

          {isChatMinimized && (
            <div
              className="flex-1 flex items-center justify-between px-4 cursor-pointer"
              onClick={() => setIsChatMinimized(false)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-sm font-medium">AI Assistant is online</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {messages.length} messages
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
