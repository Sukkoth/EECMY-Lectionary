export type Manifest = {
  manifestVersion: number;
  published: string;
  years: ManifestYear[];
};

export type ManifestYear = {
  year: number;
  languages: ManifestLanguage[];
};

export type ManifestLanguage = {
  code: string;
  name: string;
  holidays: { version: number; path: string };
  dayInfo: { version: number; path: string };
  versions: ManifestVersion[];
};

export type ManifestVersion = {
  code: string;
  name: string;
  contentVersion: number;
  path: string;
  metadata?: Record<string, string>;
};

export type DayInfoPackage = {
  version: number;
  dayInfo: {
    date: string;
    title: string;
    description: string;
    seasonColor?: string;
  }[];
};

export type HolidayPackage = {
  version: number;
  holidays: {
    date: string;
    name: string;
    description: string;
    type: string;
  }[];
};

export type ReadingsPackage = {
  version: number;
  readings: {
    date: string;
    order: number;
    section: string;
    reference: string;
    text: string;
  }[];
};
