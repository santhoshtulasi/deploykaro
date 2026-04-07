"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

interface StepProps {
  data: any;
}

export function StepSuccess({ data }: StepProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "unauth">("loading");
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const token = (session as any)?.accessToken;

  useEffect(() => {
    // Wait until NextAuth has resolved the session
    if (authStatus === "loading") return;

    if (authStatus === "unauthenticated" || !token) {
      // User reached onboarding without signing in.
      // Save preferences to localStorage so they persist after sign-in.
      localStorage.setItem("deploykaro_onboarding", JSON.stringify({
        persona: data.persona,
        language: data.language,
        slangLevel: data.slangLevel,
        displayName: data.displayName,
      }));
      setStatus("unauth");
      return;
    }

    const completeOnboarding = async () => {
      try {
        const response = await fetch("http://localhost:3001/v1/onboarding/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            persona: data.persona,
            language: data.language,
            slangLevel: data.slangLevel,
            displayName: data.displayName,
          }),
        });

        if (!response.ok) throw new Error("Failed to save profile");

        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    completeOnboarding();
  }, [data, token, authStatus]);


  if (status === "loading") {
    return (
      <div className="text-center space-y-6">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto" />
        <h2 className="text-2xl font-bold">Saving Your Profile...</h2>
        <p className="text-zinc-500">Preparing your personalized learning path with {data.persona}.</p>
      </div>
    );
  }

  if (status === "unauth") {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <Rocket className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold">Almost there!</h2>
        <p className="text-zinc-400">
          Sign in to save your preferences and start your learning journey.
          Your selections have been saved — they'll be applied after you sign in.
        </p>
        <button
          onClick={() => signIn("keycloak", { callbackUrl: "/onboarding" })}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all text-lg shadow-xl shadow-emerald-900/20"
        >
          Sign In to Continue
        </button>
        <button
          onClick={() => router.push("/mentor")}
          className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4"
        >
          Skip for now — explore as guest
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <Rocket className="w-8 h-8 text-red-500 rotate-180" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-zinc-500">We couldn't save your preferences. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
      >
        <CheckCircle2 className="w-14 h-14 text-black" />
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-white">You&apos;re All Set!</h2>
        <p className="text-zinc-400 text-lg">
          Your profile is ready. **{data.persona}** is waiting for you in the chat room.
        </p>
      </div>

      <button
        onClick={() => router.push("/mentor")}
        className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all text-xl shadow-xl shadow-emerald-900/20"
      >
        Enter DeployKaro
        <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
}
