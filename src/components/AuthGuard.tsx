import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no user, kick them to login
          // We save their current location so we can send them back after login
          navigate("/login", { state: { from: location }, replace: true });
        }
      } catch (error) {
        console.error("Auth check failed", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes (like logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        Checking access...
      </div>
    );
  }

  // If we are here, the user is logged in!
  return <>{children}</>;
}