import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type WrapperProps = {
      children: React.ReactNode;
};

export default function Wrapper({ children }: WrapperProps) {
      const [authenticated, setAuthenticated] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            let mounted = true;

            const init = async () => {
                  try {
                        const {
                              data: { session },
                        } = await supabase.auth.getSession();

                        if (mounted) setAuthenticated(!!session);
                  } finally {
                        if (mounted) setLoading(false);
                  }
            };

            init();

            const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
                  setAuthenticated(!!session);
            });

            return () => {
                  mounted = false;
                  sub.subscription.unsubscribe();
            };
      }, []);

      if (loading) return <div>Loading...</div>;
      if (!authenticated) return <Navigate to="/login" replace />;

      return <>{children}</>;
}