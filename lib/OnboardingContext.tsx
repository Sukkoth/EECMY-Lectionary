import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadOnboardingComplete, saveOnboardingComplete } from "./settings";

type OnboardingContextValue = {
  isOnboardingComplete: boolean;
  loading: boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingComplete().then((complete) => {
      setIsOnboardingComplete(complete);
      setLoading(false);
    });
  }, []);

  const completeOnboarding = async () => {
    await saveOnboardingComplete(true);
    setIsOnboardingComplete(true);
  };

  return (
    <OnboardingContext.Provider value={{ isOnboardingComplete, loading, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      isOnboardingComplete: true,
      loading: false,
      completeOnboarding: async () => {},
    };
  }
  return ctx;
}
