/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, Key, Palette, Users, Mail, Lock, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/dashboard-layout";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api", label: "API Keys", icon: Key },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const { user, updatePassword } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // API key state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    // load appearance pref
    const stored = localStorage.getItem("appearance:dark");
    if (stored) setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("appearance:dark", darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      const md = (user.user_metadata as any) || {};
      setFirstName(md.first_name || "");
      setLastName(md.last_name || "");
      setEmail(user.email || "");
      setAvatarUrl(md.avatar_url || "");
      fetchApiKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("id,key,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && (error as any).code !== "PGRST116") {
        // ignore not found vs actual error
        console.error("fetch api key error", error);
      }
      if (data && (data as any).key) setApiKey((data as any).key as string);
    } catch (err) {
      console.error("fetch api key", err);
    }
  };

  const generateApiKey = async () => {
    if (!user) return toast.error("Please sign in to generate an API key");
    setGeneratingKey(true);
    try {
      const array = new Uint8Array(48);
      crypto.getRandomValues(array);
      const key = Array.from(array, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");

      const { data, error } = await supabase
        .from("api_keys")
        .insert({ user_id: user.id, key })
        .select("id,key,created_at")
        .single();
      if (error) throw error;
      const generated = (data as any).key as string;
      setApiKey(generated);
      setNewlyGeneratedKey(generated);
      toast.success("API key generated. Save it now — it will be shown once.");
    } catch (err) {
      console.error("generate api key", err);
      toast.error("Failed to generate API key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const revokeApiKeys = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
      setApiKey(null);
      toast.success("All API keys revoked");
      setShowRevokeDialog(false);
    } catch (err) {
      console.error("revoke keys", err);
      toast.error("Failed to revoke API keys");
    }
  };

  const saveProfile = async () => {
    if (!user) return toast.error("Please sign in");
    try {
      const metadata: Record<string, unknown> = {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      };
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err) {
      console.error("update profile", err);
      toast.error("Failed to update profile");
    }
  };

  const handleChangePasswordConfirm = async () => {
    if (!passwordInput) return toast.error("Please enter a new password");
    if (passwordInput.length < 6)
      return toast.error("Password must be at least 6 characters");
    const res = await updatePassword(passwordInput);
    if (res.success) {
      toast.success("Password updated");
      setShowChangePasswordDialog(false);
      setPasswordInput("");
    } else toast.error(res.error || "Failed to update password");
  };

  const handleAvatarSave = async () => {
    if (!user) return toast.error("Please sign in");
    try {
      const metadata: Record<string, unknown> = {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarInput,
      };
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
      setAvatarUrl(avatarInput);
      toast.success("Avatar updated");
      setShowAvatarDialog(false);
    } catch (err) {
      console.error("update avatar", err);
      toast.error("Failed to update avatar");
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="flex gap-8">
        <div className="w-56 shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-1">Profile Settings</h2>
                <p className="text-muted-foreground text-sm">
                  Manage your personal information
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-2xl">
                  {firstName || lastName
                    ? `${(firstName || "").charAt(0)}${(lastName || "").charAt(
                        0
                      )}`.toUpperCase()
                    : (user?.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAvatarInput(avatarUrl || "");
                      setShowAvatarDialog(true);
                    }}
                  >
                    Change photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can paste an image URL to use as avatar
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={email}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h3 className="font-semibold mb-4">Security</h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordInput("");
                    setShowChangePasswordDialog(true);
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button variant="hero" onClick={saveProfile}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFirstName("");
                    setLastName("");
                    setAvatarUrl("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Team Members</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage your team and permissions
                  </p>
                </div>
                <Button variant="hero">
                  <Users className="w-4 h-4" />
                  Invite Member
                </Button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-1">Appearance</h2>
                <p className="text-muted-foreground text-sm">
                  Customize how SprintPilot looks
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">Dark mode</p>
                      <p className="text-sm text-muted-foreground">
                        Use dark theme across the app
                      </p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-1">API Keys</h2>
                <p className="text-muted-foreground text-sm">
                  Manage your API access
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Production Key</p>
                    <p className="text-sm text-muted-foreground">
                      Use this key for production apps
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGenerateDialog(true)}
                      disabled={generatingKey}
                    >
                      {apiKey ? "Regenerate" : "Generate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRevokeDialog(true)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={apiKey ?? ""}
                    placeholder={apiKey ? undefined : "No API key generated"}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (apiKey) {
                        navigator.clipboard.writeText(apiKey);
                        toast.success("API key copied to clipboard");
                      } else {
                        toast.error("No API key available");
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-1">Billing</h2>
                <p className="text-muted-foreground text-sm">
                  Manage your subscription and payment
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl border border-primary/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      $29/month • Renews Jan 15, 2025
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Usage this month
                    </p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    45 / 100 blueprints
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                <p className="text-muted-foreground text-sm">
                  Configure how you receive updates
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Email notifications",
                    description: "Receive updates via email",
                  },
                  {
                    label: "Blueprint complete",
                    description: "When AI finishes generating",
                  },
                  {
                    label: "Team activity",
                    description: "When team members make changes",
                  },
                  {
                    label: "Product updates",
                    description: "New features and improvements",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change avatar</DialogTitle>
            <DialogDescription>
              Paste an image URL to use as your avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Input
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              placeholder="https://example.com/me.png"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAvatarSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter a new password (min 6 characters).
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleChangePasswordConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API keys</DialogTitle>
            <DialogDescription>
              This will permanently delete all API keys for your account. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm">
            Are you sure you want to revoke all API keys?
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={revokeApiKeys}>
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API key</DialogTitle>
            <DialogDescription>
              A new API key will be created. It will be shown once — copy it and
              store it safely.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm">
            Generate a new API key for use with the SprintPilot API?
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={generateApiKey} disabled={generatingKey}>
              {generatingKey
                ? "Generating..."
                : apiKey
                ? "Regenerate"
                : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {newlyGeneratedKey && (
        <Dialog
          open={!!newlyGeneratedKey}
          onOpenChange={(open) => {
            if (!open) setNewlyGeneratedKey(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your new API key</DialogTitle>
              <DialogDescription>
                This key is shown once. Copy and store it securely.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <Input value={newlyGeneratedKey} readOnly className="font-mono" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(newlyGeneratedKey || "");
                  toast.success("API key copied to clipboard");
                }}
              >
                Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
