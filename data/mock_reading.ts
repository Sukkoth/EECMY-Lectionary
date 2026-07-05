import type { DailyReading, MultiReadingDay } from "@/lib/types";

const MOCK_READINGS: DailyReading[] = [
  {
    date: new Date(2026, 6, 5),
    passage:
      '"The Lord is my shepherd; I shall not want. In verdant pastures he gives me repose; beside restful waters he leads me; he refreshes my soul."',
    reference: "Psalm 23:1–3",
    season: "Lent",
  },
  {
    date: new Date(2026, 6, 6),
    passage:
      '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are they who mourn, for they will be comforted. Blessed are the meek, for they will inherit the land."',
    reference: "Matthew 5:1–12",
    season: "Ordinary Time",
  },
];

const MOCK_MULTI_READINGS: MultiReadingDay[] = [
  {
    date: new Date(2026, 6, 5),
    season: "Ordinary Time",
    readings: [
      {
        section: "old-testament",
        sectionLabel: "Old Testament",
        reference: "Amos 9:11–15",
        text: '"On that day I will raise up the fallen hut of David; I will wall up its breaches, raise its ruins, and rebuild it as in the days of old, that they may possess the remnant of Edom, and all nations that bear my name, says the LORD, who will do this. Yes, days are coming, says the LORD, when the plowman shall overtake the reaper, and the vintager, the sower of the seed; the mountains shall drip down wine, and all the hills shall flow. I will bring about the restoration of my people Israel; they shall rebuild and inhabit their ruined cities, plant vineyards and drink the wine, set out gardens and eat the fruits. I will plant them upon their own ground; never again shall they be uprooted from the land I have given them, says the LORD, your God."',
      },
      {
        section: "epistles",
        sectionLabel: "Epistle",
        reference: "Romans 8:18–23",
        text: "I consider that the sufferings of this present time are as nothing compared with the glory to be revealed for us. For creation awaits with eager expectation the revelation of the children of God. For creation was made subject to futility, not of its own accord but because of the one who subjected it, in hope that creation itself would be set free from slavery to corruption and share in the glorious freedom of the children of God. We know that all creation is groaning in labor pains even until now; and not only that, but we ourselves, who have the firstfruits of the Spirit, also groan within ourselves as we wait for adoption, the redemption of our bodies.",
      },
      {
        section: "gospel",
        sectionLabel: "Gospel",
        reference: "Matthew 9:14–17",
        text: 'Then the disciples of John approached him and said, "Why do we and the Pharisees fast much, but your disciples do not fast?" Jesus answered them, "Can the wedding guests mourn as long as the bridegroom is with them? The days will come when the bridegroom is taken away from them, and then they will fast. No one patches an old cloak with a piece of unshrunken cloth, for its fullness pulls away from the cloak and the tear gets worse. People do not put new wine into old wineskins. Otherwise the skins burst, the wine spills out, and the skins are ruined. Rather, they pour new wine into fresh wineskins, and both are preserved."',
      },
    ],
  },
  {
    date: new Date(2026, 6, 6),
    season: "Lent",
    readings: [
      {
        section: "epistles",
        sectionLabel: "Epistles",
        reference: "Romans 8:9, 11–13",
        text: 'But you are not in the flesh; on the contrary, you are in the spirit, if only the Spirit of God dwells in you. Whoever does not have the Spirit of Christ does not belong to him. If the Spirit of the one who raised Jesus from the dead dwells in you, the one who raised Christ from the dead will give life to your mortal bodies also, through his Spirit dwelling in you. Consequently, brothers, we are debtors not to the flesh, to live according to the flesh. For if you live according to the flesh, you will die, but if by the Spirit you put to death the deeds of the body, you will live."',
      },
      {
        section: "gospel",
        sectionLabel: "Gospel",
        reference: "Matthew 11:25–30",
        text: 'At that time Jesus said in reply, "I give praise to you, Father, Lord of heaven and earth, for although you have hidden these things from the wise and the learned you have revealed them to the childlike. Yes, Father, such has been your gracious will. All things have been handed over to me by my Father. No one knows the Son except the Father, and no one knows the Father except the Son and anyone to whom the Son wishes to reveal him. Come to me, all you who labor and are burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am meek and humble of heart; and you will find rest for yourselves. For my yoke is easy, and my burden light."',
      },
    ],
  },
];

export function getReadingForDate(year: number, month: number, day: number): DailyReading | null {
  return (
    MOCK_READINGS.find((r) => {
      const d = r.date;
      return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
    }) ?? null
  );
}

export function getMultiReadingForDate(
  year: number,
  month: number,
  day: number,
): MultiReadingDay | null {
  return (
    MOCK_MULTI_READINGS.find((r) => {
      const d = r.date;
      return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
    }) ?? null
  );
}
