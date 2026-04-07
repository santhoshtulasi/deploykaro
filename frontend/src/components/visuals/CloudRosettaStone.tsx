"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Globe, Server, Database, Shield, Activity, HardDrive, Box } from "lucide-react";

const ROSETTA_DATA = [
    {
        concept: "Object Storage",
        icon: <Database size={16} />,
        aws: "S3",
        gcp: "GCS",
        azure: "Blob Storage",
        onprem: "MinIO / Ceph"
    },
    {
        concept: "Orchestration",
        icon: <Box size={16} />,
        aws: "EKS",
        gcp: "GKE",
        azure: "AKS",
        onprem: "Kubernetes / Nomad"
    },
    {
        concept: "Serverless",
        icon: <Activity size={16} />,
        aws: "Lambda",
        gcp: "Cloud Functions",
        azure: "Azure Functions",
        onprem: "Knative / OpenFaaS"
    },
    {
        concept: "CI/CD",
        icon: <Activity size={16} />,
        aws: "CodePipeline",
        gcp: "Cloud Build",
        azure: "Azure Pipelines",
        onprem: "Jenkins / ArgoCD"
    },
    {
        concept: "Secrets",
        icon: <Shield size={16} />,
        aws: "Secrets Manager",
        gcp: "Secret Manager",
        azure: "Key Vault",
        onprem: "Vault"
    },
    {
        concept: "Managed DB",
        icon: <HardDrive size={16} />,
        aws: "RDS",
        gcp: "Cloud SQL",
        azure: "SQL Database",
        onprem: "PostgreSQL / MySQL"
    }
];

type CloudProvider = 'aws' | 'gcp' | 'azure' | 'onprem';

export function CloudRosettaStone() {
    const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('aws');

    const providers: { id: CloudProvider; name: string; color: string }[] = [
        { id: 'aws', name: 'AWS', color: 'text-amber-500' },
        { id: 'gcp', name: 'GCP', color: 'text-blue-500' },
        { id: 'azure', name: 'Azure', color: 'text-sky-500' },
        { id: 'onprem', name: 'Local/On-Prem', color: 'text-emerald-500' }
    ];

    return (
        <div className="w-full h-full bg-zinc-950 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-zinc-900">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="text-emerald-500" size={20} />
                    <div>
                        <h3 className="text-white font-black italic uppercase tracking-tighter text-xl">Cloud Rosetta Stone</h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Multi-Cloud Concept Mapper</p>
                    </div>
                </div>

                {/* Provider Selector */}
                <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    {providers.map((p) => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedProvider(p.id)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                selectedProvider === p.id 
                                ? "bg-zinc-800 text-white shadow-lg border border-zinc-700" 
                                : "text-zinc-500 hover:text-zinc-400"
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 gap-4">
                    {ROSETTA_DATA.map((item, idx) => (
                        <motion.div 
                            key={item.concept}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{item.concept}</h4>
                                    <AnimatePresence mode="wait">
                                        <motion.p 
                                            key={selectedProvider}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 5 }}
                                            className={`text-sm font-black italic tracking-tight ${providers.find(p => p.id === selectedProvider)?.color}`}
                                        >
                                            {item[selectedProvider]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Ghost Labels for others */}
                            <div className="hidden lg:flex items-center gap-6 opacity-20 group-hover:opacity-60 transition-opacity pr-4">
                                {providers.filter(p => p.id !== selectedProvider).map(p => (
                                    <div key={p.id} className="text-right">
                                        <p className="text-[8px] text-zinc-600 font-bold uppercase">{p.name}</p>
                                        <p className="text-[10px] text-zinc-400 font-mono italic">{item[p.id]}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-zinc-900/50 border-t border-zinc-900 text-[9px] text-zinc-500 text-center italic">
                Citing official documentation from AWS, Google Cloud, and Microsoft Azure.
            </div>
        </div>
    );
}
