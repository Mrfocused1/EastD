"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (for OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session from OAuth callback
          await supabaseAuth.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }

        // Check if we have a valid session
        const { data: { session } } = await supabaseAuth.auth.getSession();

        if (session) {
          router.push('/profile');
        } else {
          router.push('/auth/login?error=auth_callback_failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login?error=auth_callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/40 mb-4" />
        <p className="text-black/60">Completing sign in...</p>
      </div>
    </div>
  );
}
