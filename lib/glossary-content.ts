export type GlossaryLanguage = "en" | "am" | "om";

type ContentSection = { heading: string; body: string };
type ChurchSeason = { name: string; purpose: string; theme: string; duration: string };
type Creed = { name: string; introduction: string; text: string };

export type GlossaryContent = {
  lectionary: { title: string; sections: ContentSection[] };
  churchYear: { title: string; intro: string; seasons: ChurchSeason[] };
  creeds: { title: string; creeds: Creed[] };
  lordsPrayer: { title: string; introduction: string; text: string };
};

// ---------------------------------------------------------------------------
// English content
// ---------------------------------------------------------------------------

const englishContent: GlossaryContent = {
  lectionary: {
    title: "The Lectionary",
    sections: [
      {
        heading: "What the word 'Lectionary' means",
        body: `The word "lectionary" comes from the Latin word lectionarium, meaning "a book of readings." A lectionary is a collection of Bible readings arranged in a specific order for use in Christian worship. Rather than choosing passages randomly, the lectionary provides a structured way to encounter God's Word throughout the year.`,
      },
      {
        heading: "Why churches use a lectionary",
        body: `Churches use a lectionary to ensure that the congregation hears a wide range of Scripture over time. A well-designed lectionary guides worshippers through the major themes of the Bible — from Creation to Revelation — ensuring that no significant part of God's story is overlooked. It also helps pastors and teachers prepare messages that connect with what Christians around the world are reading on any given day.`,
      },
      {
        heading: "How the lectionary follows the Church Year",
        body: `The lectionary is closely tied to the Church Year, also known as the liturgical calendar. This calendar marks the seasons and events of Christ's life and the life of the Church. During Advent, for example, readings focus on anticipation and hope. During Lent, they turn to repentance and the journey to the cross. The lectionary ensures that the readings for each season match its spiritual focus.`,
      },
      {
        heading: "How readings are organized",
        body: `The lectionary in this app provides three readings each day:

• Old Testament — Stories, prophecies, and laws from the Hebrew Scriptures that foreshadow or illuminate the Gospel.
• Epistle — A reading from one of the New Testament letters (such as Romans, Ephesians, or James), offering instruction and encouragement.
• Gospel — A passage from Matthew, Mark, Luke, or John, recounting the words and deeds of Jesus Christ.

On normal days, only one reading is assigned — typically just one of the three. On Sundays and some major holidays, all three readings are read together, giving a fuller picture of God's Word for the day.`,
      },
      {
        heading: "The purpose of the readings in worship",
        body: `The daily readings serve several purposes: they nourish personal devotion, provide material for meditation and prayer, and connect individual believers with the wider Church. When Christians around the world read the same passages on the same day, they are united in a shared encounter with God's Word — even if they worship in different languages, cultures, and traditions.`,
      },
      {
        heading: "How to use the lectionary within this app",
        body: `This app provides the daily lectionary readings for your selected language and Bible version. On normal days, you'll find a single reading assigned for the day. On Sundays and major holidays, three readings are provided: Old Testament, Epistle, and Gospel. You can browse readings for any date using the calendar, and star your favourites to return to passages that speak to you.`,
      },
    ],
  },
  churchYear: {
    title: "The Church Year",
    intro: `The Church Year (also called the liturgical calendar) is a cycle of seasons and holy days that structures the Christian's journey through the year. Each season has a distinct spiritual focus, guiding worshippers through the story of salvation — from anticipation and incarnation to resurrection and the life of the Church.`,
    seasons: [
      {
        name: "Advent",
        purpose: "A season of waiting and preparation for the celebration of Christ's birth at Christmas.",
        theme: "Hope, expectation, and the coming of the Messiah",
        duration: "4 weeks (beginning the Sunday closest to November 30)",
      },
      {
        name: "Christmas",
        purpose: "Celebrating the incarnation of God in the birth of Jesus Christ.",
        theme: "The Word became flesh — God enters human history",
        duration: "12 days (December 25 through January 5)",
      },
      {
        name: "Epiphany",
        purpose: "Marking the revelation of Christ to the world, beginning with the visit of the Magi.",
        theme: "Christ is revealed as the Savior of all nations",
        duration: "Variable (January 6 through the Sunday before Ash Wednesday)",
      },
      {
        name: "Lent",
        purpose: "A season of repentance, self-examination, and spiritual discipline in preparation for Easter.",
        theme: "Repentance, sacrifice, and the journey to the cross",
        duration: "40 days (excluding Sundays, beginning Ash Wednesday)",
      },
      {
        name: "Holy Week",
        purpose: "The most sacred week of the Church Year, commemorating the final days of Christ's earthly life.",
        theme: "The Passion, death, and victory of Christ",
        duration: "1 week (Palm Sunday through Holy Saturday)",
      },
      {
        name: "Easter",
        purpose: "The joyful celebration of Christ's resurrection from the dead — the foundation of Christian faith.",
        theme: "Resurrection, new life, and victory over sin and death",
        duration: "50 days (Easter Sunday through Pentecost)",
      },
      {
        name: "Pentecost",
        purpose: "Remembering the descent of the Holy Spirit upon the disciples, empowering the Church for mission.",
        theme: "The Holy Spirit, the birth of the Church, and the power of God's Word",
        duration: "1 day (celebrated 50 days after Easter), often followed by Trinity Sunday",
      },
      {
        name: "Trinity Season (Ordinary Time)",
        purpose: "A time of growth in faith and discipleship, focusing on the teachings and works of Christ.",
        theme: "The life of the Church, discipleship, and the reign of Christ",
        duration: "Variable (the Sundays after Pentecost until Advent; the longest season of the Church Year)",
      },
    ],
  },
  creeds: {
    title: "The Creeds",
    creeds: [
      {
        name: "Apostles' Creed",
        introduction:
          "The Apostles' Creed is the oldest and most widely used summary of Christian belief. It is commonly recited in worship services, baptisms, and daily prayer.",
        text: `I believe in God, the Father almighty,
creator of heaven and earth.

I believe in Jesus Christ, his only Son, our Lord,
who was conceived by the Holy Spirit,
born of the Virgin Mary,
suffered under Pontius Pilate,
was crucified, died, and was buried;
he descended to the dead.
On the third day he rose again;
he ascended into heaven,
he is seated at the right hand of the Father,
and he will come to judge the living and the dead.

I believe in the Holy Spirit,
the holy catholic Church,
the communion of saints,
the forgiveness of sins,
the resurrection of the body,
and the life everlasting.
Amen.`,
      },
      {
        name: "Nicene Creed",
        introduction:
          "The Nicene Creed is a statement of faith formulated at the Councils of Nicaea (325 AD) and Constantinople (381 AD). It is used in many Christian traditions during worship.",
        text: `We believe in one God,
the Father, the Almighty,
maker of heaven and earth,
of all that is, seen and unseen.

We believe in one Lord, Jesus Christ,
the only Son of God,
eternally begotten of the Father,
God from God, Light from Light,
true God from true God,
begotten, not made,
of one Being with the Father;
through him all things were made.
For us and for our salvation
he came down from heaven,
was incarnate of the Holy Spirit and the Virgin Mary,
and became truly human.
For our sake he was crucified under Pontius Pilate,
he suffered death and was buried.
On the third day he rose again
in accordance with the Scriptures;
he ascended into heaven
and is seated at the right hand of the Father.
He will come again in glory to judge the living and the dead,
and his kingdom will have no end.

We believe in the Holy Spirit, the Lord, the giver of life,
who proceeds from the Father and the Son,
who with the Father and the Son is worshiped and glorified,
who has spoken through the prophets.
We believe in one holy catholic and apostolic Church.
We acknowledge one baptism for the forgiveness of sins.
We look for the resurrection of the dead,
and the life of the world to come.
Amen.`,
      },
      {
        name: "Athanasian Creed",
        introduction:
          "The Athanasian Creed is an ancient statement of faith attributed to St. Athanasius. It is known for its detailed explanation of the Trinity and the two natures of Christ.",
        text: `Whoever desires to be saved must, above all things, hold the catholic faith. Which faith except one keep whole and undefiled, without doubt he shall perish everlastingly.

And the catholic faith is this: That we worship one God in Trinity, and Trinity in Unity; Neither confounding the Persons, nor dividing the Substance. For there is one Person of the Father, another of the Son, and another of the Holy Ghost. But the Godhead of the Father, of the Son, and of the Holy Ghost, is all one, the Glory equal, the Majesty co-eternal.

Such as the Father is, such is the Son, and such is the Holy Ghost. The Father uncreate, the Son uncreate, and the Holy Ghost uncreate. The Father incomprehensible, the Son incomprehensible, and the Holy Ghost incomprehensible. The Father eternal, the Son eternal, and the Holy Ghost eternal. And yet they are not three Eternals, but one Eternal. As also there are not three Uncreated, nor three Incomprehensible, but one Uncreated, and one Incomprehensible.

So likewise the Father is Almighty, the Son Almighty, and the Holy Ghost Almighty. And yet they are not three Almighties, but one Almighty. So the Father is God, the Son is God, and the Holy Ghost is God. And yet they are not three Gods, but one God.

So likewise the Father is Lord, the Son Lord, and the Holy Ghost Lord. And yet they are not three Lords, but one Lord. For like as we are compelled by the Christian verity to acknowledge every Person by himself to be God and Lord, so we are forbidden by the catholic religion to say, there are three Gods or three Lords.

The Father is made of none, neither created, nor begotten. The Son is of the Father alone, not made, nor created, but begotten. The Holy Ghost is of the Father and of the Son, neither made, nor created, nor begotten, but proceeding.

So there is one Father, not three Fathers; one Son, not three Sons; one Holy Ghost, not three Holy Ghosts. And in this Trinity none is before or after other; none is greater or less than another; But the whole three Persons are co-eternal together, and co-equal. So that in all things, as is aforesaid, the Unity in Trinity, and the Trinity in Unity is to be worshipped.

He therefore that will be saved must thus think of the Trinity.

Furthermore, it is necessary to everlasting salvation that he also believe rightly the incarnation of our Lord Jesus Christ. For the right faith is, that we believe and confess, that our Lord Jesus Christ, the Son of God, is God and Man; God, of the Substance of the Father, begotten before the worlds; and Man, of the Substance of his Mother, born in the world; Perfect God and Perfect Man, of a reasonable Soul and human Flesh subsisting; Equal to the Father as touching his Godhead, and inferior to the Father as touching his Manhood. Who, although he is God and Man, yet he is not two, but one Christ. One, not by conversion of the Godhead into Flesh, but by taking of the Manhood into God. One altogether, not by confusion of Substance, but by unity of Person. For as the reasonable Soul and Flesh is one Man, so God and Man is one Christ.

Who suffered for our salvation, descended into hell, rose again the third day from the dead. He ascended into heaven, he sitteth on the right hand of the Father, God Almighty, from whence he shall come to judge the quick and the dead. At whose coming all men shall rise again with their bodies, and shall give account for their own works. And they that have done good shall go into life everlasting; and they that have done evil, into everlasting fire.

This is the catholic faith; which except a man believe faithfully and firmly, he cannot be saved.`,
      },
    ],
  },
  lordsPrayer: {
    title: "The Lord's Prayer",
    introduction:
      "The Lord's Prayer is the prayer that Jesus taught His disciples when they asked Him to teach them how to pray. It is the most widely known and recited prayer in Christianity, used in worship services, personal devotion, and daily life.",
    text: `Our Father, who art in heaven,
hallowed be thy name.
Thy kingdom come,
thy will be done,
on earth as it is in heaven.
Give us this day our daily bread,
and forgive us our trespasses,
as we forgive those who trespass against us.
And lead us not into temptation,
but deliver us from evil.
For thine is the kingdom,
and the power, and the glory,
forever and ever.
Amen.`,
  },
};

// ---------------------------------------------------------------------------
// Amharic placeholder content
// ---------------------------------------------------------------------------

const amharicContent: GlossaryContent = {
  lectionary: {
    title: "TBD — የልክ𝒕ዮናሪ ርዕሶች",
    sections: [
      { heading: "TBD — የልክ𝒕ዮናሪ ቃል ማንነት", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
      { heading: "TBD — እናት ቤቶች ለምን ይጠቀማሉ", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
      { heading: "TBD — የክርስቶስ ቤት ዓመትን እንዴት ይከተላል", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
      { heading: "TBD — ርዕሶች እንዴት ይደረጋሉ", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
      { heading: "TBD — በመቅደስ ርዕሶች ዓላማ", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
      { heading: "TBD — በመተግበሪቱ ውስጥ እንዴት ይጠቀሙ", body: "TBD — አማርኛ ትርጉም ዝግጅት" },
    ],
  },
  churchYear: {
    title: "TBD — የክርስቶስ ቤት ዓመት",
    intro: "TBD — አማርኛ ትርጉም ዝግጅት",
    seasons: [
      { name: "TBD — አድ벤ት", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ቅristማስ", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ኤፒፋኒ", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ሌንት", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ቅዱስ ሳምንት", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ኤስተር", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ፔንጢኮስት", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — ትርይኒቲ ዘመን", purpose: "TBD", theme: "TBD", duration: "TBD" },
    ],
  },
  creeds: {
    title: "TBD — ሃይማኖቶች",
    creeds: [
      {
        name: "TBD — የአፖስቶሎች ሃይማኖት",
        introduction: "TBD — አማርኛ ትርጉም ዝግጅት",
        text: "TBD",
      },
      {
        name: "TBD — የኒክያ ሃይማኖት",
        introduction: "TBD — አማርኛ ትርጉም ዝግጅት",
        text: "TBD",
      },
      {
        name: "TBD — የአታናሲያ ሃይማኖት",
        introduction: "TBD — አማርኛ ትርጉም ዝግጅት",
        text: "TBD",
      },
    ],
  },
  lordsPrayer: {
    title: "TBD — የጌታ ጸሎት",
    introduction: "TBD — አማርኛ ትርጉም ዝግጅት",
    text: "TBD",
  },
};

// ---------------------------------------------------------------------------
// Afaan Oromoo placeholder content
// ---------------------------------------------------------------------------

const oromooContent: GlossaryContent = {
  lectionary: {
    title: "TBD — Lectionary",
    sections: [
      { heading: "TBD — Haala keecci lectionary jedhu", body: "TBD — Afaan Oromoo" },
      { heading: "TBD — Kanbiyyiin lectionary fayyadama", body: "TBD — Afaan Oromoo" },
      { heading: "TBD — Lectionary waliin kanbiyya Kristiinii", body: "TBD — Afaan Oromoo" },
      { heading: "TBD — Dorgommii lectionary", body: "TBD — Afaan Oromoo" },
      { heading: "TBD — Lectionary kabajaa haqaa", body: "TBD — Afaan Oromoo" },
      { heading: "TBD — Appi kana keessatti lectionary fayyadami", body: "TBD — Afaan Oromoo" },
    ],
  },
  churchYear: {
    title: "TBD — Waggaa Kanbiyyaa",
    intro: "TBD — Afaan Oromoo",
    seasons: [
      { name: "TBD — Advent", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Christmas", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Epiphany", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Lent", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Holy Week", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Easter", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Pentecost", purpose: "TBD", theme: "TBD", duration: "TBD" },
      { name: "TBD — Trinity Season", purpose: "TBD", theme: "TBD", duration: "TBD" },
    ],
  },
  creeds: {
    title: "TBD — Aamantoota",
    creeds: [
      {
        name: "TBD — Aamanta Apostoloota",
        introduction: "TBD — Afaan Oromoo",
        text: "TBD",
      },
      {
        name: "TBD — Aamanta Nicaea",
        introduction: "TBD — Afaan Oromoo",
        text: "TBD",
      },
      {
        name: "TBD — Aamanta Athanasius",
        introduction: "TBD — Afaan Oromoo",
        text: "TBD",
      },
    ],
  },
  lordsPrayer: {
    title: "TBD — Baqqeecha Haqaa",
    introduction: "TBD — Afaan Oromoo",
    text: "TBD",
  },
};

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------

export const GLOSSARY_CONTENT: Record<GlossaryLanguage, GlossaryContent> = {
  en: englishContent,
  am: amharicContent,
  om: oromooContent,
};
