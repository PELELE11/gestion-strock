import { Boxes } from "lucide-react";
import { motion } from "framer-motion";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="glass-panel p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-xl bg-[#2563eb] flex items-center justify-center mx-auto">
              <Boxes className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white font-['Space_Grotesk']">
                GestionSync
              </h1>
              <p className="text-xs text-[#888888] uppercase tracking-[0.15em] mt-1">
                Stock Management
              </p>
            </div>
          </div>

          <p className="text-sm text-[#888888] text-center">
            Sign in to access your inventory dashboard
          </p>

          <button
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
            className="w-full btn-primary py-3 justify-center"
          >
            Sign in with Kimi
          </button>

          <p className="text-xs text-[#888888] text-center">
            Secure authentication powered by Kimi OAuth
          </p>
        </div>
      </motion.div>
    </div>
  );
}
