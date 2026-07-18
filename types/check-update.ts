import type {
  Manifest as ContentManifest,
  ManifestYear,
  ManifestLanguage,
  ManifestVersion,
} from "../lib/content";

export type WizardStep =
  | "idle"
  | "checking"
  | "selectYear"
  | "selectLang"
  | "downloading"
  | "success";

export type VersionOption = ManifestVersion;
export type LanguageOption = ManifestLanguage;
export type YearOption = ManifestYear;
export type Manifest = ContentManifest;

export const STEP_LABELS = ["Check", "Select", "Download"] as const;
export const STEP_ICONS = ["search-outline", "list-outline", "download-outline"] as const;
