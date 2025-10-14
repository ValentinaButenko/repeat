"use client";
import { useGeneration } from "../components/GenerationContext";
import ProgressPopover from "../components/ProgressPopover";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { progress } = useGeneration();
  
  return (
    <>
      {children}
      <ProgressPopover
        isVisible={progress.isVisible}
        current={progress.current}
        total={progress.total}
        setName={progress.setName}
        onStop={progress.onStop}
      />
    </>
  );
}
