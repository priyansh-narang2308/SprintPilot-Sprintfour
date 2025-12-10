import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          toast.error(errorDescription || "Authentication failed");

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
          return;
        }
        toast.success("Authentication successful!");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
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
