"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";

export default function UserAuthMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="w-24 h-8 bg-zinc-800 animate-pulse rounded-lg bg-opacity-50"></div>;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("keycloak")}
        className="flex items-center gap-2 group px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
          <User size={12} className="text-zinc-500 group-hover:text-emerald-500" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Log In</span>
      </button>
    );
  }

  // Extract user details
  const username = session?.user?.name || session?.user?.email?.split("@")[0] || "Developer";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center font-black text-xs text-white shadow-inner">
          {initial}
        </div>
        <span className="text-sm font-bold text-white tracking-tight max-w-[100px] truncate">
          {username}
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-zinc-800/50 mb-2">
              <p className="text-xs text-zinc-500 font-medium truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Signed In
              </p>
            </div>

            <button
              onClick={() => { setIsOpen(false); router.push("/dashboard"); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2 transition-colors"
            >
              <LayoutDashboard size={14} className="text-emerald-500" />
              My Dashboard
            </button>
            
            <div className="h-px bg-zinc-800/50 my-1 mx-2"></div>
            
            <button
              onClick={() => { 
                setIsOpen(false); 
                signOut({ callbackUrl: "/", redirect: true }); 
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
