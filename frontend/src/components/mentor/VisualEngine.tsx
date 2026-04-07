"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Volume2, VolumeX, Globe } from "lucide-react";
import { VisualKitchen } from "../visuals/VisualKitchen";
import { VisualTiffin } from "../visuals/VisualTiffin";
import { VisualCloud } from "../visuals/VisualCloud";
import { VisualDockerfile } from "../visuals/VisualDockerfile";
import { VisualFleet } from "../visuals/VisualFleet";
import { CloudRosettaStone } from "../visuals/CloudRosettaStone";
import { VisualSoftware } from "../visuals/VisualSoftware";
import { VisualInternet } from "../visuals/VisualInternet";
import { VisualK8sNodes } from "../visuals/VisualK8sNodes";
import { VisualK8sScaling } from "../visuals/VisualK8sScaling";
import { VisualK8sHealing } from "../visuals/VisualK8sHealing";
import { useState, useEffect } from "react";

interface VisualEngineProps {
  visualId: string | null;
  onClose: () => void;
  expertMode?: boolean;
}

export function VisualEngine({ visualId, onClose, expertMode = false }: VisualEngineProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState<'analogy' | 'technical'>(expertMode ? 'technical' : 'analogy');

  // Sync with global expert mode change
  useEffect(() => {
    setViewMode(expertMode ? 'technical' : 'analogy');
  }, [expertMode]);

  const renderTechnicalLayer = () => {
    // This will be expanded into a dedicated TechnicalLayer component
    switch (visualId) {
      case "vis_server_kitchen":
        return (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 text-emerald-400">
                <Maximize2 size={24} />
                <h3 className="text-xl font-bold font-mono">EC2/Virtual Server Architecture</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Compute</span>
                    <p className="text-xs text-zinc-300 mt-2">vCPU (Xen/KVM Hypervisor)</p>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Storage</span>
                    <p className="text-xs text-zinc-300 mt-2">EBS (Elastic Block Store)</p>
                </div>
            </div>
            <div className="p-4 bg-black border border-emerald-500/20 rounded-xl font-mono text-[11px]">
                <p className="text-emerald-500/50 mb-2"># Spin up a new server instance</p>
                <p className="text-emerald-400">aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t2.micro</p>
            </div>
          </div>
        );
      case "vis_docker_tiffin":
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 text-sky-400">
                    <Maximize2 size={24} />
                    <h3 className="text-xl font-bold font-mono">Docker Runtime Context</h3>
                </div>
                <div className="p-4 bg-black border border-sky-500/20 rounded-xl font-mono text-[11px]">
                    <p className="text-sky-500/50 mb-2"># Build and run the container</p>
                    <p className="text-sky-300">docker build -t my-app .</p>
                    <p className="text-sky-300">docker run -p 8080:80 my-app</p>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        A **Container** is an isolated user-space instance that shares the host OS kernel. It packages code, runtime, and system tools into a portable image.
                    </p>
                </div>
            </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">
            Technical mapping for {visualId} coming soon...
          </div>
        );
    }
  };

  const renderVisual = () => {
    if (viewMode === 'technical') return renderTechnicalLayer();
    
    switch (visualId) {
      case "vis_server_kitchen":
        return <VisualKitchen isMuted={isMuted} />;
      case "vis_docker_tiffin":
        return <VisualTiffin isMuted={isMuted} />;
      case "vis_cloud_electricity":
        return <VisualCloud isMuted={isMuted} />;
      case "vis_dockerfile":
        return <VisualDockerfile isMuted={isMuted} />;
      case "vis_k8s_fleet":
        return <VisualFleet isMuted={isMuted} />;
      case "vis_k8s_nodes":
        return <VisualK8sNodes isMuted={isMuted} />;
      case "vis_k8s_scaling":
        return <VisualK8sScaling isMuted={isMuted} />;
      case "vis_k8s_healing":
        return <VisualK8sHealing isMuted={isMuted} />;
      case "vis_rosetta_stone":
        return <CloudRosettaStone />;
      case "vis_software_lego":
        return <VisualSoftware isMuted={isMuted} />;
      case "vis_internet_post":
        return <VisualInternet isMuted={isMuted} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-zinc-500 italic">
            Visual analogy incoming...
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/20 relative">
      {/* Visual Controls */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/40">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-500/80">
                Engine: {viewMode === 'analogy' ? 'Analogy Mode' : 'Technical Mode'}
            </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Peel Back Toggle */}
          <button 
            onClick={() => setViewMode(viewMode === 'analogy' ? 'technical' : 'analogy')}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                viewMode === 'technical' 
                ? "bg-emerald-500 text-black border-emerald-400" 
                : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {viewMode === 'analogy' ? "Peel back ➜" : "Show Metaphor"}
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors ml-2"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
            <motion.div
                key={visualId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full"
            >
                {renderVisual()}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Label - Simplified */}
      <div className="p-3 text-center border-t border-zinc-900 bg-zinc-950/20">
         <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em]">DeployKaro Visual Reasoning Engine</span>
      </div>
    </div>
  );
}
