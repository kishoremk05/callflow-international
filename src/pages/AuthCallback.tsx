import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          toast.error("Authentication failed. Please try again.");
          navigate("/signup");
          return;
        }

        // Check if this is a first-time OAuth login
        // OAuth users have user_metadata set during first login
        const isFirstTimeOAuthUser =
          session.user.app_metadata.provider === "google" &&
          !session.user.user_metadata.account_type_selected;

        if (isFirstTimeOAuthUser) {
          // First-time Google user - show account type selection
          navigate("/account-type-selection");
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // If profile doesn't exist, redirect to account type selection
          navigate("/account-type-selection");
          return;
        }

        // User has completed setup, redirect to dashboard
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Something went wrong. Please try logging in again.");
        navigate("/signup");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">Completing signin...</p>
      </div>
    </div>
  );
}
