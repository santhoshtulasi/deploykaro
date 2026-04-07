"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface LeaderboardUser {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    xp: number;
}

export function Leaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const token = (session as any)?.accessToken;

    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3001/v1/user/leaderboard", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) setUsers(data.leaderboard);
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [token]);

    if (isLoading) return <div className="animate-pulse text-zinc-500 text-xs">Loading Hall of Fame...</div>;

    return (
        <div className="w-full bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                <div>
                    <h3 className="text-white font-black italic uppercase tracking-tighter text-xl">Hall of Fame</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Top DevOps Architects</p>
                </div>
                <Trophy size={24} className="text-amber-500" />
            </div>

            <div className="p-4 space-y-2">
                {users.map((u, idx) => (
                    <motion.div 
                        key={u.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                            idx === 0 
                            ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                        }`}
                    >
                        {/* Rank Icon */}
                        <div className="w-8 h-8 flex items-center justify-center">
                            {idx === 0 && <Medal size={20} className="text-amber-500" fill="currentColor" />}
                            {idx === 1 && <Medal size={20} className="text-zinc-400" fill="currentColor" />}
                            {idx === 2 && <Medal size={20} className="text-orange-600" fill="currentColor" />}
                            {idx > 2 && <span className="text-zinc-600 font-black italic">{idx + 1}</span>}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                            {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.displayName || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-zinc-500" />
                            )}
                        </div>

                        {/* Name & XP */}
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm ${idx === 0 ? "text-amber-200" : "text-white"}`}>
                                {u.displayName || `Anonymous_User_${u.id.slice(-4)}`}
                            </h4>
                            <div className="flex items-center gap-1 opacity-60">
                                <Zap size={10} className="text-amber-500" fill="currentColor" />
                                <span className="text-[10px] font-bold text-zinc-400">{u.xp} XP</span>
                            </div>
                        </div>

                        {/* Status Light */}
                        <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "bg-zinc-800"}`} />
                    </motion.div>
                ))}

                {users.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-zinc-600 text-xs italic">The Hall of Fame is still empty...</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-zinc-900">
                <button className="w-full py-3 bg-zinc-950 hover:bg-black text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all rounded-xl border border-zinc-800">
                    View Full Rankings ➔
                </button>
            </div>
        </div>
    );
}
