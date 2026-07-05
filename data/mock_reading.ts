import type { DailyReading, MultiReadingDay } from "@/lib/types";

const MOCK_READINGS: DailyReading[] = [
  {
    date: new Date(2026, 6, 2),
    passage: '"The Lord is my light and my salvation; whom should I fear? The Lord is the refuge of my life; of whom should I be afraid? One thing I ask of the Lord; this I seek: to dwell in the house of the Lord all the days of my life, to gaze on the Lords beauty."',
    reference: "Psalm 27:1, 4",
    season: "Ordinary Time",
  },
  {
    date: new Date(2026, 6, 4),
    passage: '"Come, let us sing joyfully to the Lord; let us acclaim the rock of our salvation. Let us greet him with thanksgiving; let us joyfully sing psalms to him. For the Lord is a great God, and a great king above all gods."',
    reference: "Psalm 95:1–3",
    season: "Ordinary Time",
  },
  {
    date: new Date(2026, 6, 6),
    passage: '"I will bless the Lord at all times; his praise shall be ever in my mouth. Let my soul glory in the Lord; the lowly will hear and be glad. Glorify the Lord with me, let us together extol his name. Taste and see that the Lord is good; blessed is the one who takes refuge in him."',
    reference: "Psalm 34:2–4, 9",
    season: "Ordinary Time",
  },
  {
    date: new Date(2026, 6, 8),
    passage: '"Lord, you have probed me and you know me; you know when I sit and when I stand; you understand my thoughts from afar. Where can I go from your spirit? Where can I flee from your presence? If I ascend to the heavens, you are there; if I lie down in Sheol, you are there."',
    reference: "Psalm 139:1–2, 7–8",
    season: "Ordinary Time",
  },
  {
    date: new Date(2026, 6, 10),
    passage: '"Blessed is the one who follows not the counsel of the wicked nor walks in the way of sinners, nor sits in the company of the insolent, but delights in the law of the Lord and meditates on his law day and night. He is like a tree planted near streams of water, that yields its fruit in season and whose leaves never fade."',
    reference: "Psalm 1:1–3",
    season: "Ordinary Time",
  },
];

const MOCK_MULTI_READINGS: MultiReadingDay[] = [
  {
    date: new Date(2026, 6, 3),
    season: "Ordinary Time",
    readings: [
      {
        section: "old-testament",
        sectionLabel: "Old Testament",
        reference: "Isaiah 55:6–9",
        text: 'Seek the Lord while he may be found, call upon him while he is near. Let the wicked forsake their ways and the sinful their thoughts. Let them turn to the Lord, who will have mercy on them, and to our God, who will richly pardon. For my thoughts are not your thoughts, nor are your ways my ways, says the Lord. As high as the heavens are above the earth, so high are my ways above your ways and my thoughts above your thoughts.',
      },
      {
        section: "psalm",
        sectionLabel: "Psalm",
        reference: "Psalm 145:17–18, 19–20, 21",
        text: "The Lord is just in all his ways and holy in all his works. The Lord is near to all who call upon him, to all who call upon him in truth. He fulfills the desire of those who fear him, he hears their cry and saves them. The Lord keeps all who love him, but all the wicked he will destroy. May my mouth speak the praise of the Lord, and may all flesh bless his holy name forever.",
      },
      {
        section: "gospel",
        sectionLabel: "Gospel",
        reference: "Matthew 6:7–15",
        text: 'Jesus said to his disciples: "When you pray, do not babble like the pagans, who think that they will be heard because of their many words. Do not be like them. Your Father knows what you need before you ask him. This is how you are to pray: Our Father who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven; give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. If you forgive others their transgressions, your heavenly Father will forgive you. But if you do not forgive others, neither will your Father forgive your transgressions."',
      },
    ],
  },
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
        section: "psalm",
        sectionLabel: "Psalm",
        reference: "Psalms 85:9, 11–12, 13–14",
        text: "The Lord speaks of peace to his people. / Near indeed is his salvation to those who fear him, glory dwelling in our land. / Kindness and truth shall meet; justice and peace shall kiss. / Truth shall spring out of the earth, and justice shall look down from heaven. / The Lord himself will give his benefits; our land shall yield its increase. / Justice shall walk before him, and prepare the way of his steps.",
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
    date: new Date(2026, 6, 7),
    season: "Ordinary Time",
    readings: [
      {
        section: "epistles",
        sectionLabel: "Epistles",
        reference: "Romans 8:18–23",
        text: "I consider that the sufferings of this present time are as nothing compared with the glory to be revealed for us. For creation awaits with eager expectation the revelation of the children of God; for creation was made subject to futility, not of its own accord but because of the one who subjected it, in hope that creation itself would be set free from slavery to corruption and share in the glorious freedom of the children of God. We know that all creation is groaning in labor pains even until now; and not only that, but we ourselves, who have the firstfruits of the Spirit, also groan within ourselves as we wait for adoption, the redemption of our bodies.",
      },
      {
        section: "psalm",
        sectionLabel: "Psalm",
        reference: "Psalm 34:2–3, 4–5, 6–7, 8–9",
        text: "I will bless the Lord at all times; his praise shall be ever in my mouth. Let my soul glory in the Lord; the lowly will hear and be glad. Glorify the Lord with me, let us together extol his name. I sought the Lord, and he answered me and delivered me from all my fears. Look to him that you may be radiant with joy, and your faces may not blush with shame. The angel of the Lord encamps around those who fear him, and delivers them. Taste and see the goodness of the Lord.",
      },
      {
        section: "gospel",
        sectionLabel: "Gospel",
        reference: "John 14:23–29",
        text: 'Jesus said to his disciples: "Whoever loves me will keep my word, and my Father will love him, and we will come to him and make our dwelling with him. Those who do not love me do not keep my words; yet the word you hear is not mine but that of the Father who sent me. I have told you this while I am with you. The Advocate, the Holy Spirit whom the Father will send in my name, will teach you everything and remind you of all that I told you. Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you. Do not let your hearts be troubled or afraid. You heard me tell you, I am going away and I will come back to you. If you loved me, you would rejoice that I am going to the Father, for the Father is greater than I. And now I have told you this before it happens, so that when it happens you may believe."',
      },
    ],
  },
  {
    date: new Date(2026, 6, 9),
    season: "Ordinary Time",
    readings: [
      {
        section: "old-testament",
        sectionLabel: "Old Testament",
        reference: "Jeremiah 1:4–10",
        text: 'The word of the Lord came to me, saying: Before I formed you in the womb I knew you, before you were born I dedicated you, a prophet to the nations I appointed you. "Ah, Lord God!" I said, "I do not know how to speak; I am too young!" But the Lord answered me, "Do not say, I am too young. To whomever I send you, you shall go; whatever I command you, you shall speak. Do not be afraid of them, for I am with you to deliver you, says the Lord." Then the Lord extended his hand and touched my mouth, saying to me, "See, I place my words in your mouth. This day I set you over nations and over kingdoms, to root up and to tear down, to destroy and to demolish, to build and to plant."',
      },
      {
        section: "epistles",
        sectionLabel: "Epistles",
        reference: "1 John 4:7–12",
        text: 'Beloved, let us love one another, because love is of God; everyone who loves is begotten by God and knows God. Whoever is without love does not know God, for God is love. In this way the love of God was revealed to us: God sent his only-begotten Son into the world so that we might have life through him. In this is love: not that we have loved God, but that he loved us and sent his Son as expiation for our sins. Beloved, if God so loved us, we also must love one another. No one has ever seen God. Yet, if we love one another, God remains in us, and his love is brought to perfection in us.',
      },
      {
        section: "gospel",
        sectionLabel: "Gospel",
        reference: "Mark 10:17–27",
        text: 'As Jesus was setting out on a journey, a man ran up, knelt before him, and asked him, "Good teacher, what must I do to inherit eternal life?" Jesus answered him, "Why do you call me good? No one is good but God alone. You know the commandments: You shall not kill; you shall not commit adultery; you shall not steal; you shall not bear false witness; you shall not defraud; honor your father and your mother." He replied, "Teacher, all of these I have observed from my youth." Jesus, looking at him, loved him and said to him, "You are lacking in one thing. Go, sell what you have, and give to the poor and you will have treasure in heaven; then come, follow me." At that statement his face fell, and he went away sad, for he had many possessions.',
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

export function getMultiReadingForDate(year: number, month: number, day: number): MultiReadingDay | null {
  return (
    MOCK_MULTI_READINGS.find((r) => {
      const d = r.date;
      return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
    }) ?? null
  );
}
