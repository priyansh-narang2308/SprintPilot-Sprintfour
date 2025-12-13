import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Supabase may return tokens in the URL hash (fragment) like
        // #access_token=...&refresh_token=... or as query params.
        // First, handle hash-based tokens (common for implicit redirect flows).
        const hash = window.location.hash?.replace(/^#/, "");
        if (hash) {
          const params = Object.fromEntries(
            hash
              .split("&")
              .map((pair) => pair.split("=").map(decodeURIComponent))
          ) as Record<string, string>;

          if (params.error) {
            toast.error(
              params.error_description ||
                params.error ||
                "Authentication failed"
            );
            setTimeout(() => navigate("/login", { replace: true }), 2000);
            return;
          }

          // If we have an access token and refresh token, set session locally so
          // the app's AuthProvider (which listens to auth state) can pick it up.
          if (params.access_token) {
            try {
              await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });
              toast.success("Authentication successful!");
              setTimeout(() => navigate("/dashboard", { replace: true }), 800);
              return;
            } catch (err) {
              // Fall through to query-param handling if setSession fails
              console.error("Failed to set session from hash:", err);
            }
          }
        }

        // Fallback: handle query param based responses (e.g., ?error=...)
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          toast.error(errorDescription || "Authentication failed");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        toast.success("Authentication successful!");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred during authentication";
        toast.error(errorMessage);
        navigate("/login", { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
          <Rocket className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Signing you in...</h1>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication
          </p>
        </div>

        {isProcessing && (
          <div className="flex gap-2 mt-4">
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
