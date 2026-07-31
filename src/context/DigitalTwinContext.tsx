import React, { createContext, useContext, useState, useEffect } from "react";

export type PersonaType = "value_seeker" | "tech_enthusiast" | "budget_conscious" | "premium_luxury";

export interface TwinProfile {
  name: string;
  personaType: PersonaType;
  minBudget: number;
  maxBudget: number;
  preferredStores: string[];
  preferredCategories: string[];
  riskTolerance: number; // 1 (Ultra safe) to 10 (High risk/deep discount)
  priceDropThreshold: number; // Percentage, e.g. 15%
  qualityWeight: number; // 1-10
  valueWeight: number; // 1-10
  isCalibrated: boolean;
  lastCalibratedAt?: string;
}

export interface MatchResult {
  matchScore: number; // 0 - 100
  verdict: string;
  savingsEstimate: number;
  riskRating: "Low Risk" | "Moderate Risk" | "High Risk";
  reasons: string[];
}

interface DigitalTwinContextType {
  profile: TwinProfile;
  isModalOpen: boolean;
  activeTab: "collect" | "results";
  openTwinModal: (tab?: "collect" | "results") => void;
  closeTwinModal: () => void;
  updateProfile: (updates: Partial<TwinProfile>) => void;
  calibrateTwin: (profileData: TwinProfile) => void;
  calculateMatch: (product: { title: string; price: number; store?: string; rating?: number; category?: string }) => MatchResult;
}

const DEFAULT_PROFILE: TwinProfile = {
  name: "My Shopping Twin",
  personaType: "value_seeker",
  minBudget: 5000,
  maxBudget: 120000,
  preferredStores: ["Amazon", "Flipkart", "Meesho", "Croma", "Reliance Digital"],
  preferredCategories: ["Tech & Electronics", "Fashion", "Home & Lifestyle", "Gaming"],
  riskTolerance: 4,
  priceDropThreshold: 15,
  qualityWeight: 8,
  valueWeight: 9,
  isCalibrated: true,
  lastCalibratedAt: new Date().toISOString(),
};

const STORAGE_KEY = "zgenie_digital_twin_profile";

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

export const DigitalTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<TwinProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load digital twin profile", e);
    }
    return DEFAULT_PROFILE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"collect" | "results">("results");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save digital twin profile", e);
    }
  }, [profile]);

  const openTwinModal = (tab: "collect" | "results" = "results") => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const closeTwinModal = () => {
    setIsModalOpen(false);
  };

  const updateProfile = (updates: Partial<TwinProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const calibrateTwin = (newProfile: TwinProfile) => {
    const calibrated = {
      ...newProfile,
      isCalibrated: true,
      lastCalibratedAt: new Date().toISOString(),
    };
    setProfile(calibrated);
    setActiveTab("results");
  };

  const calculateMatch = (product: { title: string; price: number; store?: string; rating?: number; category?: string }): MatchResult => {
    let score = 70;
    const reasons: string[] = [];

    // Budget match
    if (product.price >= profile.minBudget && product.price <= profile.maxBudget) {
      score += 15;
      reasons.push("Perfect match for your budget range");
    } else if (product.price > profile.maxBudget) {
      score -= 20;
      reasons.push("Above your target max budget");
    } else {
      score += 5;
      reasons.push("Under budget - high savings value");
    }

    // Preferred store match
    if (product.store && profile.preferredStores.includes(product.store)) {
      score += 10;
      reasons.push(`Sold by trusted retailer (${product.store})`);
    }

    // Rating / Quality match
    const rating = product.rating || 4.4;
    if (rating >= 4.5 && profile.qualityWeight >= 7) {
      score += 8;
      reasons.push("High quality rating aligns with your quality standards");
    }

    // Risk rating
    let riskRating: "Low Risk" | "Moderate Risk" | "High Risk" = "Low Risk";
    if (profile.riskTolerance <= 3 && rating < 4.2) {
      riskRating = "High Risk";
      score -= 15;
      reasons.push("Review distribution poses return risk for your risk tolerance");
    } else if (profile.riskTolerance <= 6 && rating < 4.4) {
      riskRating = "Moderate Risk";
    }

    const finalScore = Math.min(99, Math.max(45, score));
    const savingsEstimate = Math.round(product.price * (profile.priceDropThreshold / 100));

    let verdict = "Excellent Twin Match";
    if (finalScore >= 90) verdict = "Perfect Twin Match!";
    else if (finalScore >= 75) verdict = "Strong Twin Match";
    else verdict = "Moderate Twin Match";

    return {
      matchScore: finalScore,
      verdict,
      savingsEstimate,
      riskRating,
      reasons,
    };
  };

  return (
    <DigitalTwinContext.Provider
      value={{
        profile,
        isModalOpen,
        activeTab,
        openTwinModal,
        closeTwinModal,
        updateProfile,
        calibrateTwin,
        calculateMatch,
      }}
    >
      {children}
    </DigitalTwinContext.Provider>
  );
};

export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (!context) {
    throw new Error("useDigitalTwin must be used within a DigitalTwinProvider");
  }
  return context;
};
