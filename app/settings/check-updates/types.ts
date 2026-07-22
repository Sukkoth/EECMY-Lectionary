import type {
  Manifest as ContentManifest,
  ManifestYear,
  ManifestLanguage,
  ManifestVersion,
} from "../../../lib/content";

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

export const STEP_LABELS = ["Year", "Content", "Progress", "Done"] as const;
export const STEP_ICONS = [
  "calendar-outline",
  "list-outline",
  "cloud-download-outline",
  "checkmark-circle-outline",
] as const;

