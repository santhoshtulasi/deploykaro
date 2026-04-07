"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { StepPersona } from "@/components/onboarding/StepPersona";
import { StepExperience } from "@/components/onboarding/StepExperience";
import { StepSuccess } from "@/components/onboarding/StepSuccess";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    persona: "BUDDY",
    language: "ENGLISH",
    slangLevel: "MEDIUM",
    experienceLevel: "BEGINNER",
    displayName: "",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const updateData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const currentStepView = () => {
    switch (step) {
      case 1:
        return <StepWelcome next={nextStep} update={updateData} data={formData} />;
      case 2:
        return <StepPersona next={nextStep} back={prevStep} update={updateData} data={formData} />;
      case 3:
        return <StepExperience next={nextStep} back={prevStep} update={updateData} data={formData} />;
      case 4:
        return <StepSuccess data={formData} />;
      default:
        return <StepWelcome next={nextStep} update={updateData} data={formData} />;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStepView()}
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ${
                  s === step ? "w-8 bg-emerald-500" : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
