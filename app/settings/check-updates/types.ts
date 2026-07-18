export type WizardStep =
  | "idle"
  | "checking"
  | "selectYear"
  | "selectLang"
  | "downloading"
  | "success";

export type VersionOption = {
  code: string;
  label: string;
};

export type LanguageOption = {
  code: string;
  name: string;
  versions: VersionOption[];
};

export type YearOption = {
  year: number;
  lastUpdated: string;
  version: string;
  size: string;
  languages: LanguageOption[];
};

export type Manifest = {
  availableYears: YearOption[];
};

export const MOCK_MANIFEST: Manifest = {
  availableYears: [
    {
      year: 2026,
      lastUpdated: "July 10, 2026",
      version: "3.0.0",
      size: "4.5 MB",
      languages: [
        { code: "en", name: "English", versions: [
          { code: "niv", label: "New International Version" },
          { code: "kjv", label: "King James Version" },
          { code: "esv", label: "English Standard Version" },
        ]},
        { code: "am", name: "አማርኛ", versions: [
          { code: "am54", label: "Amharic Bible" },
          { code: "nasv", label: "New Amharic Standard Version" },
        ]},
        { code: "om", name: "Afaan Oromoo", versions: [
          { code: "macqul", label: "Macaafa Qulqulluu Afaan Oromoo" },
        ]},
      ],
    },
    {
      year: 2025,
      lastUpdated: "June 20, 2025",
      version: "2.4.0",
      size: "4.2 MB",
      languages: [
        { code: "en", name: "English", versions: [
          { code: "niv", label: "New International Version" },
          { code: "kjv", label: "King James Version" },
        ]},
        { code: "am", name: "አማርኛ", versions: [
          { code: "am54", label: "Amharic Bible" },
          { code: "nasv", label: "New Amharic Standard Version" },
        ]},
      ],
    },
    {
      year: 2024,
      lastUpdated: "June 15, 2024",
      version: "2.1.0",
      size: "4.0 MB",
      languages: [
        { code: "en", name: "English", versions: [
          { code: "niv", label: "New International Version" },
          { code: "kjv", label: "King James Version" },
        ]},
        { code: "am", name: "አማርኛ", versions: [
          { code: "am54", label: "Amharic Bible" },
        ]},
      ],
    },
  ],
};

export const STEP_LABELS = ["Check", "Select", "Download"] as const;
export const STEP_ICONS = ["search-outline", "list-outline", "download-outline"] as const;
export const CHECK_DELAY_MS = 1500;
export const DOWNLOAD_TICK_MS = 50;
export const DOWNLOAD_TOTAL_MS = 3500;
