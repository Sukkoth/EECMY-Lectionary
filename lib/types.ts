export type ReadingType = "first" | "psalm" | "second" | "gospel";

export type Reading = {
  id: string;
  type: ReadingType;
  label: string;
  book: string;
  chapter: number;
  verseRange: string;
  text?: string;
  isLongReading: boolean;
};

export type DailyReadings = {
  date: string;
  liturgicalDay: string;
  season: string;
  readings: Reading[];
};

export const MOCK_TODAY: DailyReadings = {
  date: "July 4, 2026",
  liturgicalDay: "Saturday of the Thirteenth Week in Ordinary Time",
  season: "Ordinary Time",
  readings: [
    {
      id: "first-1",
      type: "first",
      label: "First Reading",
      book: "Amos",
      chapter: 9,
      verseRange: "11–15",
      isLongReading: false,
      text: '"On that day I will raise up the fallen hut of David; I will wall up its breaches, raise its ruins, and rebuild it as in the days of old, that they may possess the remnant of Edom, and all nations that bear my name, says the LORD, who will do this. Yes, days are coming, says the LORD, when the plowman shall overtake the reaper, and the vintager, the sower of the seed; the mountains shall drip down wine, and all the hills shall flow. I will bring about the restoration of my people Israel; they shall rebuild and inhabit their ruined cities, plant vineyards and drink the wine, set out gardens and eat the fruits. I will plant them upon their own ground; never again shall they be uprooted from the land I have given them, says the LORD, your God."',
    },
    {
      id: "psalm-1",
      type: "psalm",
      label: "Responsorial Psalm",
      book: "Psalms",
      chapter: 85,
      verseRange: "9, 11–12, 13–14",
      isLongReading: false,
      text: 'The Lord speaks of peace to his people. / Near indeed is his salvation to those who fear him, glory dwelling in our land. / Kindness and truth shall meet; justice and peace shall kiss. / Truth shall spring out of the earth, and justice shall look down from heaven. / The Lord himself will give his benefits; our land shall yield its increase. / Justice shall walk before him, and prepare the way of his steps.',
    },
    {
      id: "gospel-1",
      type: "gospel",
      label: "Gospel",
      book: "Matthew",
      chapter: 9,
      verseRange: "14–17",
      isLongReading: false,
      text: 'Then the disciples of John approached him and said, "Why do we and the Pharisees fast much, but your disciples do not fast?" Jesus answered them, "Can the wedding guests mourn as long as the bridegroom is with them? The days will come when the bridegroom is taken away from them, and then they will fast. No one patches an old cloak with a piece of unshrunken cloth, for its fullness pulls away from the cloak and the tear gets worse. People do not put new wine into old wineskins. Otherwise the skins burst, the wine spills out, and the skins are ruined. Rather, they pour new wine into fresh wineskins, and both are preserved."',
    },
  ],
};

export const MOCK_SUNDAY: DailyReadings = {
  date: "July 5, 2026",
  liturgicalDay: "Fourteenth Sunday in Ordinary Time",
  season: "Ordinary Time",
  readings: [
    {
      id: "sun-first-1",
      type: "first",
      label: "First Reading",
      book: "Zechariah",
      chapter: 9,
      verseRange: "9–10",
      isLongReading: true,
    },
    {
      id: "sun-psalm-1",
      type: "psalm",
      label: "Responsorial Psalm",
      book: "Psalms",
      chapter: 145,
      verseRange: "1–2, 8–9, 10–11, 13–14",
      isLongReading: true,
    },
    {
      id: "sun-second-1",
      type: "second",
      label: "Second Reading",
      book: "Romans",
      chapter: 8,
      verseRange: "9, 11–13",
      isLongReading: true,
    },
    {
      id: "sun-gospel-1",
      type: "gospel",
      label: "Gospel",
      book: "Matthew",
      chapter: 11,
      verseRange: "25–30",
      isLongReading: true,
    },
  ],
};

export type DailyReading = {
  date: Date;
  passage: string;
  reference: string;
};

export type ReadingStreak = {
  current: number;
  best: number;
  completedDays: boolean[]; // length = 7, index 0 = Sunday
};

export const MOCK_READING: DailyReading = {
  date: new Date(),
  passage:
    '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are they who mourn, for they will be comforted. Blessed are the meek, for they will inherit the land. Blessed are they who hunger and thirst for righteousness, for they will be satisfied. Blessed are the merciful, for they will be shown mercy. Blessed are the clean of heart, for they will see God. Blessed are the peacemakers, for they will be called children of God. Blessed are they who are persecuted for the sake of righteousness, for theirs is the kingdom of heaven."',
  reference: "Matthew 5:1–12",
};

export const MOCK_STREAK: ReadingStreak = {
  current: 7,
  best: 14,
  completedDays: [true, true, true, true, true, false, false],
};
