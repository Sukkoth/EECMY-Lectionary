export type ReadingStreak = {
  current: number;
  best: number;
  completedDays: boolean[]; // length = 7, index 0 = Sunday
  lastCompletedDate: string | null; // YYYY-MM-DD of last completed reading
  weekStartDate: string; // YYYY-MM-DD of the Sunday that started this week
};

export type FavouriteReading = {
  id: string;
  reference: string;
  passagePreview: string;
  dateSaved: string;
};

export const MOCK_FAVOURITES: FavouriteReading[] = [
  {
    id: "fav-1",
    reference: "Matthew 5:1–12",
    passagePreview:
      "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are they who mourn, for they will be comforted.",
    dateSaved: "Jul 3, 2026",
  },
  {
    id: "fav-2",
    reference: "Psalm 23:1–6",
    passagePreview:
      "The Lord is my shepherd; I shall not want. In verdant pastures he gives me repose; beside restful waters he leads me.",
    dateSaved: "Jul 1, 2026",
  },
  {
    id: "fav-3",
    reference: "Romans 8:31–39",
    passagePreview:
      "If God is for us, who can be against us? He who did not spare his own Son but handed him over for us all, how will he not also give us everything else along with him?",
    dateSaved: "Jun 28, 2026",
  },
  {
    id: "fav-4",
    reference: "John 1:1–5",
    passagePreview:
      "In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things came to be through him.",
    dateSaved: "Jun 25, 2026",
  },
];
