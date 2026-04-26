import { Link } from "react-router";
import { Home, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#FF5252]/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-[#FF5252]" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-white font-['Space_Grotesk']">404</h1>
          <p className="text-lg text-[#888888] mt-2">Page not found</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
