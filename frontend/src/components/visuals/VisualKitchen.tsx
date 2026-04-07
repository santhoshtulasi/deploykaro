"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, UtensilsCrossed, ChefHat, ShoppingBasket, BellRing, PackageSearch, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

export function VisualKitchen({ isMuted }: VisualProps) {
  const [orders, setOrders] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Request, 2: Process, 3: Success

  // Loop the animation for demo purposes
  useEffect(() => {
    const sequence = async () => {
      while (true) {
        // 1. New Request
        setActiveStep(1);
        setOrders(prev => [...prev, Date.now()]);
        await new Promise(r => setTimeout(r, 2000));

        // 2. Processing
        setActiveStep(2);
        await new Promise(r => setTimeout(r, 3000));

        // 3. Success
        setActiveStep(3);
        setOrders(prev => prev.slice(1));
        await new Promise(r => setTimeout(r, 1500));

        // Reset
        setActiveStep(0);
        await new Promise(r => setTimeout(r, 1000));
      }
    };

    sequence();
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden bg-zinc-950">
      <div className="relative w-full max-w-2xl aspect-video border border-zinc-800/50 rounded-3xl bg-zinc-900/20 shadow-2xl overflow-hidden flex items-center justify-around px-8">
        
        {/* Customer Area (Input) */}
        <div className="flex flex-col items-center gap-4 z-10 w-32">
            <div className={`p-4 rounded-2xl border transition-all duration-500 bg-zinc-900 ${activeStep === 1 ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'border-zinc-800'}`}>
                <SendHorizontal className={`w-10 h-10 ${activeStep === 1 ? 'text-emerald-500' : 'text-zinc-600'}`} />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Request (Order)</span>
        </div>

        {/* The Connection (Wire) */}
        <div className="absolute top-1/2 left-[20%] right-[20%] h-px bg-zinc-800/50 -translate-y-1/2" />
        
        {/* The Kitchen (The Server) */}
        <div className="flex flex-col items-center gap-6 z-10 w-48 relative">
            <motion.div 
                animate={{ 
                    scale: activeStep === 2 ? [1, 1.05, 1] : 1,
                    rotate: activeStep === 2 ? [0, 1, -1, 0] : 0
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`p-8 rounded-[40px] border-4 transition-all duration-500 bg-zinc-900/80 shadow-2xl relative ${activeStep === 2 ? 'border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10' : 'border-zinc-800'}`}
            >
                <div className="absolute -top-4 -left-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <ChefHat className={`w-5 h-5 ${activeStep === 2 ? 'text-emerald-500' : 'text-zinc-500'}`} />
                </div>

                <UtensilsCrossed className={`w-16 h-16 ${activeStep === 2 ? 'text-emerald-500 animate-pulse' : 'text-zinc-700'}`} />
                
                {/* Ingredient Pantry (Memory/DB) */}
                <motion.div 
                    animate={{ y: activeStep === 2 ? [0, -5, 0] : 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-4 -right-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                    <PackageSearch className={`w-5 h-5 ${activeStep === 2 ? 'text-emerald-500' : 'text-zinc-500'}`} />
                </motion.div>
            </motion.div>

            <div className="text-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeStep === 2 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {activeStep === 2 ? 'Cooking (Processing)' : 'The Server (Kitchen)'}
                </span>
            </div>

            {/* SSE / Chunk Visualizer */}
            <AnimatePresence>
                {activeStep === 2 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1"
                    >
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-1 h-3 rounded-full bg-emerald-500 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Output Area (Response) */}
        <div className="flex flex-col items-center gap-4 z-10 w-32">
            <motion.div 
                animate={{ 
                    y: activeStep === 3 ? [0, -40, 0] : 0, 
                    opacity: activeStep === 3 ? 1 : 0.5 
                }}
                className={`p-4 rounded-2xl border transition-all duration-500 bg-zinc-900 ${activeStep === 3 ? 'border-emerald-500' : 'border-zinc-800'}`}
            >
                <Coffee className={`w-10 h-10 ${activeStep === 3 ? 'text-emerald-500' : 'text-zinc-700'}`} />
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeStep === 3 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {activeStep === 3 ? 'Served!' : 'Response (The Meal)'}
            </span>
        </div>

        {/* Floating Orders */}
        {orders.map(order => (
            <motion.div
                key={order}
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: [ -300, 0, 300 ], opacity: [ 0, 1, 1, 0 ] }}
                transition={{ duration: 6, times: [0, 0.4, 0.9, 1], ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2"
            >
                <div className="w-8 h-1 bg-emerald-500/50 rounded-full blur-[2px]" />
            </motion.div>
        ))}
      </div>

      <div className="mt-12 max-w-md text-center space-y-4">
        <h3 className="text-xl font-bold">Concept: Request/Response Cycle</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
            Just like a kitchen, a server doesn&apos;t just "have" your data. It takes your order (Request), fetches ingredients (DB/Memory), cooks them (CPU Logic), and serves it back (Response).
        </p>
      </div>

      {/* Logic for ding sound on step 3 success */}
      <AudioSuccessTrigger activeStep={activeStep} isMuted={isMuted} />
    </div>
  );
}

function AudioSuccessTrigger({ activeStep, isMuted }: { activeStep: number, isMuted?: boolean }) {
    useEffect(() => {
        if (activeStep === 3 && !isMuted) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); // A nice bell/ding
            audio.volume = 0.2;
            audio.play().catch(() => {}); // Catch browser autoplay policy errors
        }
    }, [activeStep, isMuted]);
    return null;
}
