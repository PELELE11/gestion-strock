import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderNotifications: true,
    theme: "dark",
    language: "en",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-[#888888] mt-1">Manage your preferences</p>
        </div>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <User className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2563eb]/20 flex items-center justify-center">
              <span className="text-xl font-semibold text-[#2563eb]">
                {user?.name?.charAt(0) ?? "U"}
              </span>
            </div>
            <div>
              <p className="text-base font-medium text-white">{user?.name ?? "User"}</p>
              <p className="text-sm text-[#888888]">{user?.email ?? "No email"}</p>
              <p className="text-xs text-[#888888] mt-1 capitalize">
                Role: {user?.role ?? "user"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#d97706]" />
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            {
              key: "emailNotifications" as const,
              label: "Email Notifications",
              desc: "Receive email updates",
            },
            {
              key: "lowStockAlerts" as const,
              label: "Low Stock Alerts",
              desc: "Get warned when stock runs low",
            },
            {
              key: "orderNotifications" as const,
              label: "Order Updates",
              desc: "Notifications for new orders",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-[#888888]">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings[item.key] ? "bg-[#2563eb]" : "bg-white/[0.1]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    settings[item.key] ? "translate-x-5.5 left-0.5" : "left-0.5"
                  }`}
                  style={{ transform: settings[item.key] ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#8b5cf6]" />
          <h2 className="text-sm font-semibold text-white">Appearance</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-[#888888]">Interface color scheme</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="select-field w-36"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Language</p>
              <p className="text-xs text-[#888888]">Display language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="select-field w-36"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00C853]" />
          <h2 className="text-sm font-semibold text-white">Security</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Session</p>
              <p className="text-xs text-[#888888]">Your session is active</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00C853]/10 border border-[#00C853]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
              <span className="text-xs font-medium text-[#00C853]">Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
