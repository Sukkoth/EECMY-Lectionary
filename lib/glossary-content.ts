export type GlossaryLanguage = "en" | "am" | "om";

type ContentSection = { heading: string; body: string };
type ChurchSeason = {
  name: string;
  purpose: string;
  theme: string;
  duration: string;
  sundays?: string;
};
type Creed = { name: string; introduction: string; text: string };

export type GlossaryContent = {
  lectionary: { title: string; sections: ContentSection[] };
  churchYear: {
    title: string;
    intro: string;
    labels?: {
      purpose: string;
      theme: string;
      duration: string;
      sundays: string;
    };
    seasons: ChurchSeason[];
  };
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
    labels: {
      purpose: "Purpose",
      theme: "Theme",
      duration: "Duration",
      sundays: "Sundays & Feasts",
    },
    seasons: [
      {
        name: "Advent",
        purpose: "A season of waiting and preparation for the celebration of Christ's birth at Christmas.",
        theme: "Hope, expectation, and the coming of the Messiah",
        duration: "4 weeks (beginning the Sunday closest to November 30)",
        sundays: "1st, 2nd, 3rd, and 4th Sunday of Advent",
      },
      {
        name: "Christmas",
        purpose: "Celebrating the incarnation of God in the birth of Jesus Christ.",
        theme: "The Word became flesh — God enters human history",
        duration: "12 days (December 25 through January 5 / Tahsas 29)",
        sundays: "Christmas Day, 1st Sunday after Christmas",
      },
      {
        name: "Epiphany",
        purpose: "Marking the revelation of Christ to the world, beginning with the visit of the Magi and His baptism.",
        theme: "Christ is revealed as the Light and Savior of all nations",
        duration: "Variable (January 19 / Tir 11 through the Sunday before Ash Wednesday)",
        sundays: "Epiphany, 1st through 6th Sunday after Epiphany",
      },
      {
        name: "Lent",
        purpose: "A season of repentance, self-examination, and spiritual discipline in preparation for Easter.",
        theme: "Repentance, sacrifice, and the journey to the cross",
        duration: "55 days (7 weeks leading up to Easter)",
        sundays: "1st through 6th Sunday in Lent",
      },
      {
        name: "Holy Week",
        purpose: "The most sacred week of the Church Year, commemorating the final days and passion of Christ.",
        theme: "The Passion, death, and victory of Christ",
        duration: "1 week (Palm Sunday through Holy Saturday)",
        sundays: "Palm Sunday, Maundy Thursday, Good Friday, Holy Saturday",
      },
      {
        name: "Easter",
        purpose: "The joyful celebration of Christ's resurrection from the dead — the foundation of Christian faith.",
        theme: "Resurrection, new life, and victory over sin and death",
        duration: "50 days (Easter Sunday through Pentecost)",
        sundays: "Easter Day, 1st through 6th Sunday after Easter, Ascension Day",
      },
      {
        name: "Pentecost",
        purpose: "Remembering the descent of the Holy Spirit upon the disciples and the birth of the Church.",
        theme: "The Holy Spirit, the birth of the Church, and the power of God's Word",
        duration: "1 day (celebrated 50 days after Easter), followed by Trinity Sunday",
        sundays: "Pentecost Day, Trinity Sunday",
      },
      {
        name: "Trinity Season (Ordinary Time)",
        purpose: "A time of growth in faith and discipleship, focusing on the teachings and works of Christ.",
        theme: "The life of the Church, discipleship, and the reign of Christ",
        duration: "Variable (the Sundays after Pentecost until Advent; the longest season of the Church Year)",
        sundays: "1st through 26th Sunday after Trinity",
      },
      {
        name: "End of the Church Year (Judgment Sunday)",
        purpose: "Remembering the end of times, watchfulness, and the return of Christ.",
        theme: "Watchful preparation, eternal life, and the final judgment",
        duration: "The final two Sundays before Advent",
        sundays: "Sunday Preceding Judgment Sunday, Judgment Sunday",
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
// Amharic content
// ---------------------------------------------------------------------------

const amharicContent: GlossaryContent = {
  lectionary: {
    title: "የመካነ ኢየሱስ የዕለት ንባብ (ሌክሽነሪ)",
    sections: [
      {
        heading: "«ሌክሽነሪ» ማለት ምን ማለት ነው?",
        body: `«ሌክሽነሪ» የሚለው ቃል «lectionarium» ከተባለው የላቲን ቃል የተገኘ ሲሆን ትርጉሙም «የንባብ መጽሐፍ» ማለት ነው። ሌክሽነሪ በክርስቲያናዊ የአምልኮ ሥርዓት ውስጥ ጥቅም ላይ እንዲውል የተዘጋጀ የመጽሐፍ ቅዱስ ንባቦች ስብስብ ነው። ክፍሎችን በዘፈቀደ ከመምረጥ ይልቅ፥ ሌክሽነሪ ዓመቱን ሙሉ የእግዚአብሔርን ቃል በሥርዓትና በቅደም ተከተል እንድናጠና ይረዳናል።`,
      },
      {
        heading: "አብያተ ክርስቲያናት ሌክሽነሪን ለምን ይጠቀማሉ?",
        body: `አብያተ ክርስቲያናት ሌክሽነሪን የሚጠቀሙት ምእመናን በጊዜ ሂደት የተለያዩ የመጽሐፍ ቅዱስ ክፍሎችን እንዲሰሙ ለማድረግ ነው። በጥንቃቄ የተዘጋጀ ሌክሽነሪ አምላኪዎችን ከፍጥረት እስከ ራእይ ካሉት ዋና ዋና የመጽሐፍ ቅዱስ ርዕሶች ጋር ያስተዋውቃቸዋል። በተጨማሪም አገልጋዮች በዓለም ዙሪያ ካሉ ክርስቲያኖች ጋር በተመሳሳይ ቀን የሚነበቡትን መልእክቶች እንዲያስተምሩ ይረዳቸዋል።`,
      },
      {
        heading: "ሌክሽነሪ የቤተ ክርስቲያንን ዓመት እንዴት ይከተላል?",
        body: `ሌክሽነሪ የቤተ ክርስቲያን ዘመን (የሥርዓተ አምልኮ ካሌንደር) ጋር በጥብቅ የተያያዘ ነው። ይህም ካሌንደር የክርስቶስን ምድራዊ ሕይወትና የቤተ ክርስቲያንን ሁነቶች መሠረት ያደርጋል። ለምሳሌ በአድቬንት (ጾመ ነቢያት) ወቅት ንባቦቹ በጽኑ ተስፋና በመጠባበቅ ላይ ያተኩራሉ። በዐብይ ጾም ወቅት ደግሞ ወደ ንስሐና ወደ መስቀሉ ጉዞ ያደላሉ።`,
      },
      {
        heading: "ንባቦች እንዴት ተደራጅተዋል?",
        body: `በዚህ መተግበሪያ ውስጥ ያለው ሌክሽነሪ በየዕለቱ ሦስት የንባብ ክፍሎችን ያቀርባል፦

• ብሉይ ኪዳን — ለወንጌል ጥላና ምስክር የሆኑ ከብሉይ ኪዳን የተወሰዱ ክፍሎች።
• መልእክት — ከሐዋርያት መልእክታት (እንደ ሮሜ፥ ኤፌሶን፥ ያዕቆብ) የተወሰዱ የመመሪያና የምክር ንባቦች።
• ወንጌል — የጌታችን የኢየሱስ ክርስቶስን ቃልና ሥራ የሚያስረዱ ከማቴዎስ፥ ማርቆስ፥ ሉቃስና ዮሐንስ የተወሰዱ ክፍሎች።

በመደበኛ የሥራ ቀናት አንድ ንባብ ብቻ የሚመደብ ሲሆን፥ በእሁድ እና በታላላቅ በዓላት ቀናት ግን ሦስቱም ክፍሎች አብረው ይነበባሉ።`,
      },
      {
        heading: "የንባቦች ዓላማ በአምልኮ ውስጥ",
        body: `የዕለት ንባቦች የግል መንፈሳዊ ሕይወትን ያጠናክራሉ፥ ለማሰላሰልና ለጸሎት ግብዓት ይሆናሉ፥ እንዲሁም ምእመናንን ከዓለም አቀፍ ቤተ ክርስቲያን ጋር ያገናኛሉ። በዓለም ዙሪያ ያሉ ክርስቲያኖች በተመሳሳይ ቀን አንድ ዓይነት ጥቅስ ሲያነቡ፥ በልዩ ልዩ ቋንቋና ባህል ውስጥ ቢሆኑም በእግዚአብሔር ቃል አንድ ይሆናሉ።`,
      },
      {
        heading: "በዚህ መተግበሪያ ውስጥ ሌክሽነሪን እንዴት መጠቀም ይቻላል?",
        body: `ይህ መተግበሪያ በተመረጠው ቋንቋና የመጽሐፍ ቅዱስ ትርጉም መሠረት የዕለት ንባቦችን ያቀርባል። በመደበኛ ቀናት የዕለቱን ንባብ ያገኛሉ። በእሁድና በበዓላት ደግሞ ብሉይ ኪዳን፥ መልእክት እና ወንጌል ተዘጋጅተው ይቀርባሉ። የካሌንደር ገጽን በመጠቀም የማንኛውንም ቀን ንባብ መመልከት እና የተወደዱ ጥቅሶችን ማስቀመጥ ይችላሉ።`,
      },
    ],
  },
  churchYear: {
    title: "የቤተ ክርስቲያን ዓመት",
    intro: `የቤተ ክርስቲያን ዓመት (የሥርዓተ አምልኮ ካሌንደር) የክርስቲያኖችን ዓመታዊ የመንፈሳዊ ሕይወት ጉዞ የሚያደራጅ የዘመናትና የበዓላት አውድ ነው። እያንዳንዱ ዘመን ምእመናንን ከክርስቶስ ልደት እስከ ትንሣኤና እስከ ቤተ ክርስቲያን ሕይወት የሚያመላክት ልዩ መንፈሳዊ ዓላማ አለው።`,
    labels: {
      purpose: "ዓላማ",
      theme: "ጭብጥ",
      duration: "የቆይታ ጊዜ",
      sundays: "የእሑድ ስሞችና በዓላት",
    },
    seasons: [
      {
        name: "የመምጣቱ ሰሞን (አድቬንት)",
        purpose: "የክርስቶስን ልደት ለማክበር የሚደረግ የዝግጅትና የጽኑ ተስፋ ዘመን።",
        theme: "ተስፋ፥ መጠባበቅ እና የመሲሑ ምጽአት",
        duration: "4 ሳምንታት (ከታኅሣሥ ወር መጀመሪያ ጀምሮ)",
        sundays: "የመምጣቱ 1ኛ፥ 2ኛ፥ 3ኛ እና 4ኛ እሑድ",
      },
      {
        name: "የልደት በዓል (ዘመነ ልደት / ገና)",
        purpose: "የእግዚአብሔር ሰው መሆንና የኢየሱስ ክርስቶስ ልደት የሚከበርበት ታላቅ በዓል።",
        theme: "ቃሉም ሥጋ ሆነ — አምላክ ወደ ሰው ታሪክ ገባ",
        duration: "12 ቀናት (ከታኅሣሥ 29/ጥር 7 ጀምሮ)",
        sundays: "የልደት በዓል (ገና)፥ ከልደት በኋላ 1ኛ እሑድ",
      },
      {
        name: "ጥምቀት (ኤጲፋኒ)",
        purpose: "ክርስቶስ ለዓለም ሁሉ መድኃኒት ሆኖ መገለጡና መጠመቁ የሚታሰብበት ዘመን።",
        theme: "ክርስቶስ የአሕዛብ ሁሉ ብርሃን ሆኖ ተገለጠ",
        duration: "ከጥር 11 (ጥምቀት) እስከ ዐብይ ጾም ዋዜማ",
        sundays: "የጥምቀት በዓል፥ ከአስተርእዮ/ጥምቀት በኋላ 1ኛ እስከ 6ኛ እሑድ",
      },
      {
        name: "ዐብይ ጾም",
        purpose: "ለፋሲካ በዓል ለመዘጋጀት የሚደረግ የንስሐ፥ የጸሎትና የራስን የመመርመር ዘመን።",
        theme: "ንስሐ፥ መስዋዕትነት እና ወደ መስቀሉ የሚደረግ ጉዞ",
        duration: "55 ቀናት (ከዘወረደ እስከ ትንሣኤ)",
        sundays: "የዐብይ ጾም 1ኛ እስከ 6ኛ እሑዶች",
      },
      {
        name: "ሰሙነ ሕማማት (ቅዱስ ሳምንት)",
        purpose: "የክርስቶስን ምድራዊ ሕይወት የመጨረሻ ቀናትና መከራ የምናስብበት እጅግ ቅዱስ ሳምንት።",
        theme: "የክርስቶስ ሕማማት፥ ስቅለትና ሞት",
        duration: "1 ሳምንት (ከሆሣዕና እስከ ቅዳሜ ሥዑር)",
        sundays: "የሆሣዕና እሑድ፥ ጸሎተ ሐሙስ፥ ስቅለት፥ ቅዳሜ ሥዑር",
      },
      {
        name: "ትንሣኤ (ፋሲካ)",
        purpose: "የክርስቲያን እምነት መሠረት የሆነውን የክርስቶስን ከሙታን መነሣት የምናከብርበት የደስታ ዘመን።",
        theme: "ትንሣኤ፥ አዲስ ሕይወት እና በሞት ላይ የተገኘ ድል",
        duration: "50 ቀናት (ከትንሣኤ እሑድ እስከ ጴንጠቆስጤ)",
        sundays: "የትንሣኤ በዓል፥ ከትንሣኤ በኋላ 1ኛ እስከ 6ኛ እሑድ፥ የዕርገት በዓል",
      },
      {
        name: "በዓለ ኀምሳ (ጴንጠቆስጤ)",
        purpose: "መንፈስ ቅዱስ በደቀ መዛሙርቱ ላይ የወረደበት እና ቤተ ክርስቲያን የተመሠረተችበት ቀን።",
        theme: "መንፈስ ቅዱስ፥ የቤተ ክርስቲያን ልደት እና የእግዚአብሔር ቃል ኃይል",
        duration: "ከትንሣኤ በኋላ በ50ኛው ቀን",
        sundays: "በዓለ ኀምሳ (ጴንጠቆስጤ)፥ የሥላሴ በዓል",
      },
      {
        name: "ሥላሴ (መደበኛ ዘመን)",
        purpose: "በእምነትና በደቀ መዝሙርነት የማደግ፥ በክርስቶስ ትምህርትና ሥራ ላይ የማተኮር ዘመን።",
        theme: "የቤተ ክርስቲያን ሕይወት፥ ደቀ መዝሙርነት እና የክርስቶስ መንግሥት",
        duration: "ከሥላሴ በዓል በኋላ እስከ አድቬንት ድረስ ያለው ረጅሙ ዘመን",
        sundays: "ከሥላሴ በኋላ 1ኛ እስከ 26ኛ እሑድ",
      },
      {
        name: "የቤተ ክርስቲያን ዓመት ፍጻሜ (የፍርድ እሑድ)",
        purpose: "የዘመናት ፍጻሜና የክርስቶስ ዳግም ምጽአት የሚታሰብበት ዘመን።",
        theme: "ስለ መጨረሻው ፍርድ፥ ንቃት እና ተዘጋጅቶ መጠበቅ",
        duration: "ከመምጣቱ ሰሞን በፊት ያሉት የመጨረሻዎቹ ሁለት እሑዶች",
        sundays: "ከፍርድ እሑድ የሚቀድም እሑድ፥ የፍርድ እሑድ",
      },
    ],
  },
  creeds: {
    title: "የሃይማኖት መግለጫዎች (ክሬድስ)",
    creeds: [
      {
        name: "የሐዋርያት እምነት (Apostles' Creed)",
        introduction:
          "የሐዋርያት እምነት መግለጫ እጅግ ጥንታዊና በስፋት የሚታወቅ የክርስቲያናዊ እምነት ማጠቃለያ ነው። በአምልኮ፥ በጥምቀት እና በዕለት ጸሎት ውስጥ ይደገማል።",
        text: `እኔ ሁሉን በሚችል፤
ሰማይንና ምድርን በፈጠረ፤
በእግዚአብሔር አብ አምናለሁ።

ደግሞም በአንድ ልጁ፤
በመንፈስ ቅዱስ በተፀነሰ፤
ከድንግል ማርያም በተወለደ፤
በጴንጤናዊው በጲላጦስ ዘመን መከራ የተቀበለ፤
በተሰቀለ፤
በሞተ፤
ተቀበረ፤
ወደ ሲኦል በወረደ፤
በሦስተኛውም ቀን ከሙታን በተነሣ፤
ወደ ሰማይ በወጣ፤
ሁሉን በሚችል በእግዚአብሔር አብ ቀኝ የተቀመጠ፤
በሕያዋንና በሙታን ሊፈርድ ከዚያ በሚመለስ፤
በጌታችን በኢየሱስ ክርስቶስ አምናለሁ።

ደግሞም በመንፈስ ቅዱስ፤
በአንዲት ቅድስት የሐዋርያት ቤተ ክርስቲያን፤
በቅዱሳን አንድነት፤
በኃጢአት ሥርየት፤
በሥጋ ትንሣኤ፤
በዘላለም ሕይወት አምናለሁ። አሜን።`,
      },
      {
        name: "የኒቅያ ሃይማኖት መግለጫ (Nicene Creed)",
        introduction:
          "ማህበሩ እንደቆመ በበዓላት ጊዜና በልዩ ሥነ ሥርዓት ጊዜ የሚነበብ። በኒቂያ (325 ዓ.ም) እና በቁስጥንጥንያ (381 ዓ.ም) ጉባኤዎች የተደነገገ የሃይማኖት መግለጫ።",
        text: `ሁሉን በሚችል፤
ሰማይንና ምድርን፤
የሚታየውንና የማይታየውን በፈጠረ፤
አንድ አምላክ በሚሆን፤
በእግዚአብሔር አብ እናምናለን።

እርሱ ብቻ የአብ ልጅ በሚሆን፤
ዓለም ሳይፈጠር ከአብ በተወለደ፤
ከአምላክ በተገኘ አምላክ፤
ከብርሃን በተገኘ ብርሃን፤
እውነተኛ አምላክ በተገኘ እውነተኛ አምላክ፤
በህልውናው ከአብ ጋር አንድ በሆነ፤
በተፈጠረ ሳይሆን በተወለደ፤
ሁሉ በእርሱ ሆነ፤
ስለ እኛ ስለ ሰዎች ስለ ድኅንነታችንም ከሰማይ በወረደ፤
በመንፈስ ቅዱስ ከድንግል ማርያም ሥጋ ነሥቶ ሰው በሆነ፤
በጴንጤናዊው በጲላጦስ ዘመንም ስለ እኛ በተሰቀለ፤
መከራ የተቀበለ፤
በሞተ፤
በተቀበረም።
በቅዱሳት መጻሕፍትም እንደ ተጻፈ፤
በሦስተኛው ቀን ከሙታን ተለይቶ በተነሣ፤
ወደ ሰማይም በወጣ፤
በአብ ቀኝ በተቀመጠ፤
በሕያዋንና በሙታን ሊፈርድ ዳግመኛ በክብር በሚመጣ፤
ለመንግሥቱ ፍጻሜ በሌለው፤
በአንድ ጌታ በኢየሱስ ክርስቶስ እናምናለን።

ከአብና ከወልድ ጋር በሚሰገድለትና በሚከበር፤
ከአብና ከወልድ በሚወርድ፤
በነቢያት በተናገረ፤
የሕይወት ጌታና ሰጪ በሚሆን፤
በመንፈስ ቅዱስም እናምናለን።

የሁሉም በሆነች፤
በአንዲት ቅድስት የሐዋርያት ቤተ ክርስቲያንም እናምናለን።
ለኃጢአት ማስተስረያ በተደረገች፤
በአንዲት ጥምቀትም እናምናለን።
የሙታንንም ትንሣኤ፤
ገና የሚመጣውን ዓለም ሕይወትም እንጠብቃለን። አሜን።`,
      },
      {
        name: "የአትናቴዎስ ሃይማኖት (Athanasian Creed)",
        introduction:
          "የአትናቴዎስ የሃይማኖት መግለጫ በቅዱስ አትናቴዎስ ስም የሚጠራ ጥንታዊ መግለጫ ሲሆን ስለ ሥላሴ ምስጢርና ስለ ክርስቶስ ሰው መሆን በስፋት ያብራራል።",
        text: `ለመዳን የሚፈልግ ሰው ሁሉ ከሁሉም ነገር አስቀድሞ የሁሉ የሆነች የቤተ ክርስቲያንን ሃይማኖት እውነተኛ አድርጎ ሊቀበል ያስፈልገዋል። ንጽሕና ሙሉ አድርጎ ያልጠበቀው ሰው ሁሉ ያለ ጥርጥር የዘላለም ጥፋት ይደርስበታል።

በሦስትነቱ አንድነቱን፤ በአንድነቱም ሦስትነቱን አምነን አንድ አምላክን እናመልካለን። ይህም እውነተኛ የክርስቲያን ሃይማኖት ነው። ይህንም የምናደርገው አካላትን ሳንደባልቅ መለኮታዊ ህልውናንም ሳንክፈል ነው። ምክንያቱም የአብ አካል ለብቻው፤ የወልድ ለብቻው፤ የመንፈስ ቅዱስም ለብቻው ስለሆነ ነው።

ሆኖም የአብ፤ የወልድና የመንፈስ ቅዱስ መለኮት አንድ ነው፤ ክብሩና ሥልጣኑም አካል ሆኖ ይኖራል። ወልድ በህልውናው እንደ አብ ነው፤ መንፈስ ቅዱስም እንዲሁ ነው።

አብ አልተፈጠረም፤ ወልድ አልተፈጠረም፤ መንፈስ ቅዱስም አልተፈጠረም። አብ ወሰን የለውም፤ ወልድ ወሰን የለውም፤ መንፈስ ቅዱስም ወሰን የለውም። አብ ዘላለማዊ ነው፤ ወልድ ዘላለማዊ ነው፤ መንፈስ ቅዱስም ዘላለማዊ ነው። ቢሆንም፤ ዘላለማዊ የሚሆን አንድ እንጂ ሦስት አይደለም። ያልተፈጠረና ወሰን የሌለው ሦስት እንዳይሆን፤ እንዲሁም ያልተፈጠረና ወሰን የሌለውም አንድ ነው።

እንዲሁም አብ ሁሉን ማድረግ የሚችል ነው፤ ወልድ ሁሉን ማድረግ የሚችል ነው፤ መንፈስ ቅዱስም ሁሉን ማድረግ የሚችል ነው። ቢሆንም፤ ሁሉን ማድረግ የሚችል አንድ እንጂ ሦስት አይደለም። ስለዚህ አብ አምላክ ነው፤ ወልድ አምላክ ነው፤ መንፈስ ቅዱስም አምላክ ነው። ሆኖም፤ አንድ አምላክ እንጂ ሦስት አማልክት አይደለም። ስለዚህ አብ ጌታ ነው፤ ወልድ ጌታ ነው፤ መንፈስ ቅዱስም ጌታ ነው። ሆኖም፤ አንድ ጌታ እንጂ ሦስት ጌቶች አይደለም።

ምክንያቱም የክርስቲያን እምነት እውነተኝነት እያንዳንዱ አካል አምላክና ጌታ መሆኑን እንድናምን እንደሚያስገድደን ሁሉ፤ የክርስቲያን ሃይማኖት ሦስት አማልክት ወይም ሦስት ጌቶች እንዳንል ይከለክለናል።

አብ በማንም አልተሠራም፤ አልተፈጠረም፤ አልተወለደምም። ወልድ ከአብ ተወለደ እንጂ፤ አልተሠራም፤ አልተፈጠረምም። መንፈስ ቅዱስ አልተሠራም፤ አልተፈጠረም፤ አልተወለደምም፤ ነገር ግን ከአብና ከወልድ የሚወርድ ነው።

ስለዚህ አብ አንድ ስለሆነ ሦስት አብ አይደለም፤ ወልድም አንድ እንጂ ሦስት ወልድ አይደለም፤ መንፈስ ቅዱስም አንድ እንጂ ሦስት አይደለም። ከሦስቱ አካላት አንዱ ከሌላው ቀዳሚነት ወይም ደኃሪነት የለውም፤ አንዱም ሌላውን የሚበልጥ ወይም የሚያንስ አይደለም። ስለሆነም፤ ሦስቱ አካላት በእኩልነትና በዘላለማዊነት አንድ ናቸው። ከዚህ የተነሣም ቀደም ብሎ እንደ ተጠቀሰው ሦስቱ አካላት በአንድ መለኮት፤ አንድ አምላክም በሦስት አካላት ይመለካል። ለመዳን የሚፈልግ ሁሉ ስለ ሥላሴ እንዲሁ ማሰብ ይገባዋል።

ከዚህም ሌላ የዘላለም ድኅነት ለማግኘት የጌታችንን የኢየሱስ ክርስቶስን በሥጋ መገለጥ በእውነት ማመን አስፈላጊ ነው። ምክንያቱም ትክክለኛው እምነት ጌታችን ኢየሱስ ክርስቶስ የእግዚአብሔር ልጅ፤ አምላክም ሰውም መሆኑን አምነን ማስታወቅ ነው። እርሱም ከዘመናት አስቀድሞ ከአብ የተወለደ አምላክ፤ ከእናቱ በሥጋ በዓለም የተወለደ ሰው ነው።

የሚያስብ ነፍስ ያላትውና የሰውን ሥጋ የለበሰ ፍጹም አምላክ ፍጹም ሰው ነው። በአምላክነቱ ከአብ ጋር የተስተካከለ፤ በሰውነቱም ከአብ ያነሰ ነው። አምላክም ሰውም ቢሆንም፤ አንድ ክርስቶስ እንጂ ሁለት ክርስቶስ አይደለም። አንድ ነው ስንል ግን የሰውን ሥጋ ለበሰ እንጂ፤ መለኮትን ወደ ሥጋ አለወጠም። በእርግጥ አንድ የሆነውም በባሕርያት መደባለቅ ሳይሆን፤ በአካል አንድ በመሆኑ ነው። ምክንያቱም የሚያስብ ነፍስና ሥጋ አንድ ሰው እንደሆኑ ሁሉ፤ አምላክና ሰው በክርስቶስ አንድ ናቸው።

እርሱም ለድኅነታችን ሲል መከራ የተቀበለ፤ ወደ ሲኦል የወረደ፤ ከሙታን የተነሣ፤ ወደ ሰማይ የወጣ፤ በአብ ቀኝ የተቀመጠ፤ በሕያዋንና በሙታንም ሊፈርድ ከዚያ በሚመለስ፤ በመጣበት ጊዜም ሰዎች ሁሉ በሥጋ ተነሥተው ስለ ሥራቸው መልስ ይሰጣሉ። መልካም የሠሩ ወደ ዘላለም ሕይወት፤ ክፉ የሠሩ ወደ ዘላለም እሳት ይገባሉ።

ይህ እውነተኛው የክርስቲያን እምነት ነው፤ ይህን የማያምንና አጥብቆ የማይይዝ ሊድን አይችልም።`,
      },
    ],
  },
  lordsPrayer: {
    title: "የጌታ ጸሎት",
    introduction:
      "የጌታ ጸሎት ደቀ መዛሙርቱ ጸሎት እንዲያስተምራቸው በጠየቁት ጊዜ ኢየሱስ ያስተማራቸው ጸሎት ነው። በክርስቲያናዊ አምልኮ፥ በግል ጸሎትና በዕለት ተዕለት ሕይወት ውስጥ በሰፊው የሚጸለይ የጸሎት መሠረት ነው።",
    text: `አባታችን ሆይ በሰማያት የምትኖር፤
ስምህ ይቀደስ፤
መንግሥትህ ትምጣ፤
ፈቃድህ በሰማይ እንደ ሆነች እንዲሁም በምድር ትሁን፤
የዕለት እንጀራችንን ዛሬ ስጠን፤
እኛም ደግሞ የበደሉንን ይቅር እንደምንል በደላችንን ይቅር በለን፤
ከክፉ ሁሉ አድነን እንጂ ወደ ፈተና አታግባን፤
መንግሥት የላንተ ናትና ኃይልም ምስጋናም ለዘላለሙ፤
አሜን።`,
  },
};

// ---------------------------------------------------------------------------
// Afaan Oromoo content
// ---------------------------------------------------------------------------

const oromooContent: GlossaryContent = {
  lectionary: {
    title: "Sirna Dubbisaa (Lectionary)",
    sections: [
      {
        heading: "Jechi «Lectionary» jedhu maal jechuu dha?",
        body: `Jechi «lectionary» jedhu jecha Laatiin «lectionarium» jedhu irraa kan dhufe yoo ta'u, hiikni isaas «kitaaba dubbisaa» jechuu dha. Lectionary-n barruulee Kitaaba Qulqulluu tajaajila sagadaatiif walitti qabaman akkaataa sirna ta'een kan qophaa'ee dha. Akkuma ta'etti caqasoota filachuu irra, lectionary-n waggaa guutuu Dubbii Waaqayyoo karaa qajeelaa fi tartiiba qabuun akka qo'annu nu gargaara.`,
      },
      {
        heading: "Waldaan Kiristaanaa maaliif Lectionary fayyadamti?",
        body: `Waldaan Kiristaanaa lectionary kan fayyadamtu uummanni Waaqayyoo barruulee Kitaaba Qulqulluu bal'inaan akka dhaga'aniif. Lectionary-n qophaa'ee amantoota mata duree guguddoo Kitaaba Qulqulluu — Uumama irraa hanga Mul'ataatti — karaa guutuu ta'een duraa duubaan nu qajeelcha.`,
      },
      {
        heading: "Lectionary-n Waggaa Waldaa Kiristaanaa akkamitti hordofa?",
        body: `Lectionary-n Waggaa Waldaa Kiristaanaa (kalendarii sirna lektiyonaarii) waliin wanta walqabatuuf. Kalendariin kun bara fi ayyaanota jireenya Kiristoos fi waldaa kiristaanaa ni agarsiisa. Fakkeenyaaf, bara Advent (kadhannaa) keessa dubbisni abdiif eeggannoo irratti xiyyeeffata. Bara Soomaa keessatti garuu gara gaabbii fi qaraaniyootti garagala.`,
      },
      {
        heading: "Dubbisni akkamitti qindaa'a?",
        body: `Appii kana keessatti lectionary-n guyyaa guyyaan dubbisa sadii dhiheessa:

• Kakuu Haaraa Duraa (Kakuu Moofaa) — Raajota fi seera Kakuu Moofaa irraa kan fudhatame.
• Ergaa — Ergaawwan Kakuu Haaraa (Paawulostaa fi kanneen biroo) irraa dhihaatu.
• Wangeela — Wangeelota afran irraa dubbii fi hojii Yesuus Kiristoos kan agarsiisu.

Guyyoota hojii keessa dubbisni tokko qofti kan kennamu yoo ta'u, Dilbata fi Ayyaanota guguddoo irratti garuu dubbisni sadanuu walitti dhihaata.`,
      },
      {
        heading: "Kaayyoo dubbisaa tajaajila sagadaa keessatti",
        body: `Dubbisni guyyaa jireenya hafuuraa amantootaa ni cimsa, kadhannaaf meeshaa ta'a, akkasumas amantoota addunyaa maraa waliin tokko nu godha. Amantoonni addunyaa maraa guyyaa tokkotti dubbisa tokko yommuu dubbisan, afaan fi aadaa adda addaa qabaataniyyuu Dubbii Waaqayyootiin tokkummaa qabaatu.`,
      },
      {
        heading: "Appii kana keessatti lectionary akkamitti fayyadamama?",
        body: `Appiin kun afaan fi hiika Kitaaba Qulqulluu filatame madaalchissee dubbisa guyyaa dhiheessa. Guyyaa hojii dubbisa tokko, Dilbata fi Ayyaanota irratti dubbisa sadii argattu. Kalendarii fayyadamuun dubbisa guyyaa kamiyyuu ilaaluu fi jaallatamaan olkaachuu dandeessu.`,
      },
    ],
  },
  churchYear: {
    title: "Waggaa Waldaa Kiristaanaa",
    intro: `Waggaa Waldaa Kiristaanaa (kalendarii lektiyonaarii) jireenya hafuuraa amantootaa waggaa guutuu qajeelcha. Barri kutaawwan adda addaa qabaachuun fayyina Kiristoos irraa jalqabee hanga jireenya waldaatti amantoota ni leenjisa.`,
    labels: {
      purpose: "Kaayyoo",
      theme: "Dhaamsa",
      duration: "Turtii",
      sundays: "Sanbatoota Guddaa fi Ayyaanota",
    },
    seasons: [
      {
        name: "Bara Dhufaatii (Advent)",
        purpose: "Dhaloota Kiristoos kabajuuf qophii fi abdiidhaan eeggachuuf bara dhihaatu.",
        theme: "Abdii, eeggannoo fi dhufaatii Masiihichaati",
        duration: "Torban 4 (Mudde dura torban Dilbata irraa jalqaba)",
        sundays: "Kan Dhufaatii Isaatii SG 1ffaa, 2ffaa, 3ffaa fi 4ffaa",
      },
      {
        name: "Ayyaana Dhalootaa (Kristmas)",
        purpose: "Waaqayyo nama ta'ee dhalachuu Yesuus Kiristoos kabajuu.",
        theme: "Dubbiin foon ta'e — Waaqayyo seenaa namaa keessa gale",
        duration: "Guyyoota 12",
        sundays: "Ayyaana Dhalootaa, Dhaloota Booda Sanbata Guddaa",
      },
      {
        name: "Cuuphaa (Epiphany)",
        purpose: "Kiristoos addunyaa hundaaf fayyisaa ta'ee mul'achuu fi cuuphamuu isaa yaadachuu.",
        theme: "Kiristoos ifa saba hundaaf ta'ee mul'ate",
        duration: "Cuuphaa irraa hanga Sooma Guddaatti",
        sundays: "Ayyaana Cuuphaa, Cuuphaa Booda SG 1ffaa hanga 6ffaa",
      },
      {
        name: "Sooma Guddaa (Lent)",
        purpose: "Ayyaana Du'aa Ka'uuf qopha'uuf gaabbii fi kadhannaaf bara dhihaatu.",
        theme: "Gaabbii, aarsaa fi gara fannoo deemuun",
        duration: "Guyyoota 55 (Torban 7)",
        sundays: "Sooma Guddaa SG 1ffaa hanga 6ffaa",
      },
      {
        name: "Torban Dhiphinaa (Holy Week)",
        purpose: "Guyyoota dhumaa jireenya Kiristoos lafa irraa fi fannoo yaadachuuf torban qulqulluu.",
        theme: "Rakkina, fannoo, du'a fi mo'icha Kiristoos",
        duration: "Torban 1 (Dilbata Hoosaa'inaa irraa hanga Sanbata Guddaatti)",
        sundays: "Dilbata Hoosaa'inaa, Kamisa Qulqulluu, Guyyaa Fannoo, Sanbata Guddaa",
      },
      {
        name: "Du'aa Ka'uu (Easter)",
        purpose: "Kiristoos du'a mo'ee ka'uu isaa gammachuudhaan kabajuu — hundee amantaa kiristaanaa.",
        theme: "Du'aa ka'uu, jireenya haarawa fi mo'icha du'a irratti",
        duration: "Guyyoota 50 (Easter irraa hanga Shantaffatti)",
        sundays: "Ayyaana Du'aa Ka'uu, Du'aa Ka'uu Booda SG 1ffaa hanga 6ffaa, Guyyaa Ol Ba'uu",
      },
      {
        name: "Ayyaana Guyyaa Shantammaffaa (Pentecost)",
        purpose: "Hafuurni Qulqulluun bartoota irratti bu'uu fi waldaan dhalachuu ishee yaadachuu.",
        theme: "Hafuura Qulqulluu, dhaloota waldaa fi humna Dubbii Waaqayyoo",
        duration: "Guyyaa 50ffaa Easter irratti",
        sundays: "Ayyaana Guyyaa Shantaffaa (Phenxeqosxee), Ayyaana Sillaasee",
      },
      {
        name: "Sadan Tokkummaa (Trinity Season)",
        purpose: "Amantaa fi bartummaadhaan guddachuuf, barumsa Kiristoos irratti xiyyeeffachuu.",
        theme: "Jireenya waldaa, bartummaa fi mootummaa Kiristoos",
        duration: "Bara dheeraa Shantaffaa irraa hanga Advent-tti dhihaatu",
        sundays: "STB (Sadan Tokkummaa Booda) Sanbata Guddaa 1ffaa hanga 26ffaa",
      },
      {
        name: "Dhuma Waggaa Waldaa (Guyyaa Firdii)",
        purpose: "Waa'ee firdii dhumaa fi dhufaatii Kiristoos lammataa yaadachuu.",
        theme: "Firdii isa dhumaa, qophaa'anii eeguu",
        duration: "Sanbatoota Guddaa dhumaa lamaan",
        sundays: "SG Guyyaa Firdii Dursu, SG Guyyaa Firdii",
      },
    ],
  },
  creeds: {
    title: "Ibsa ejjennaa Amantaa",
    creeds: [
      {
        name: "Dhugaa Ba'uu Amantii Kiristaanaa Kan Ergamoota",
        introduction:
          "Amanaa Apostoloota ibsa amantaa kiristaanaa isa antique fi bal'inaan fayyadamaa dha. Tajaajila sagadaa, cuuphaa fi kadhanna keessatti deebi'ee dubbatama.",
        text: `Nan amana
Hundumaa kan danda'u, Waaqayyo Abbaatti,
Uumaa Waaqaa fi Lafaatti,
Tokkicha Ilma Isaa Yesus Kiristoos Gooftaa Keenyatti,
Kan ulfeefame Hafuura Qulqulluudhaan,
Kan dhalate Maariyaam durba irraa,
Kan dhiphates bara philaaxos pheenxinichaatti,
Kan fannifames, kan du'es, kan awwalames,
Sii'olittis kan gadi bu'e,
Guyyaa sadaffaattis du'aa kan ka'ee
Gara waaqaattis kan ol ba'e,
Hundumaa kan danda'u, gara mirga Waaqayyo Abbaas kan taa'e;
Achiiyis Kan deebi'u,
Warra jiranii fi warra du'anitti faraduudhaaf

Nan amana
Hafuura qulqulluutti
Tokkicha Qulqullaa'aa Waldaa Kiristaanaa,
Tokkummaa Qulqullootaas,
Dhiifamuu cubbus,
Du'aa ka'uu fooniis,
Jireenya bara-baraas,
Ameen`,
      },
      {
        name: "Amanaa Nikiya (Nicene Creed)",
        introduction:
          "Amanaa Nikiya ibsa amantaa Kora Nikiya (325 AD) fi Kora Kaanstaantiinoopil (381 AD) irratti murtaa'ee dha.",
        text: `In amanna hundumaa kan danda'u Waaqayyo Isa tokkicha
Abbaatti,
Uumaa waaqaatii fi lafaa,
Uumaa wanta argamuu fi wanta hin argamne hundumaa.
In amanna kan dhalate tokkicha Ilma Waaqayyoo,
Yesus Kristos Gooftaa tokkichatti;
Biyyi lafaa utuu hin uumamin bara hundumaa dura
Abbaattii kan dhalate,
Waaqayyo Waaqayyottii argame, Ifa Ifatti argame,
Waaqayyo Isa dhugaa Waaqayyo Isa dhugaattii argame;
Jiraachuun Isaa Abbaadhaa wajjin tokko kan ta'e;
Inni kan uumame utuu hin ta'in kan dhalatee dha;
Wanti hundinuu Isaan kan ta'e;
Waa'ee keenyaaf, waa'ee fayyina namootaatiif waaqa irraa
kan gadi bu'e;
Hafuura Qulqulluudhaan Maariyaam durba irraa
foon uffatee nama kan ta'e;
Bara Philaaxos Phenxenichaattis nuuf jedhee kan fannifame;
Kan dhiphate, kan du'e, kan awwaalames;
Macaafa Qulqulluu keessatti barreeffamee akka jiru,
Guyyaa sadaffaatti warra du'an keessaa kan ka'e;
Gara waaqaattis kan ol ba'e; gara mirga Abbaa kan taa'u;
Warra jiranii fi warra du'anitti faraduudhaaf lammaffaa
deebi'ee ulfinaan kan dhufu;
Mootummaan Isaas dhuma kan hin qabnetti.
In amanna Hafuura Qulqulluutti;
Goofticha Isa jireenya kennu;
Isa Abbaa fi Ilma biraa ba'u;
Abbaa fi Ilmaa wajjin kan waaqeffamu,
Ulfina argachuun kan Isaaf ta'u,
Isa karaa raajotaa dubbatetti.
In amanna kan nama hundumaa kan taate tokkittii
qulqullooftuu Waldaa Kristaanaa Ergamootaa;
Dhiifamuu cubbuu kan argachiisu cuuphaa tokkicha,
Du'aa ka'uu warra du'aniitii fi jireenya bara baraa
isa dhufuuf jiruus in eegganna. Ameen!`,
      },
      {
        name: "Amanaa Atanaatewos (Athanasian Creed)",
        introduction:
          "Amanaa Atanaatewos ibsa amantaa qulqulluu Atanaatewosiin kenname yoo ta'u, Sillaasee fi qulqullummaa Kiristoos bal'inaan ibsa.",
        text: `Namni fayyuu barbaadu hundinuu waan hundumaa dura amantiin Waldaa Kristaanaa kan nama hundumaa taate kun amantii dhuga-qabeessa ta'uu isaa amanee fudhachuun in barbaachisaaf. Namni guutummaatti, qulqullinattis isa hin eegne hundinuu, mamii tokko malee badiisni bara baraa isa irra in ga'a.

Nuyi sadanummaa Isaatti tokkummaa Isaa, tokkummaa Isaattis sadanummaa Isaa amannee, Waaqayyo tokkicha in waaqeffanna; kun Amantii Kristaanaa isa dhugaa dha. Kanas eenyummaa Isaa utuu waliin hin makin, jiraachuu Waaqayyummaa Isaatii utuu gargar hin baasin in amanna. Sababiin isaa immoo, qaamni Abbaa addaan, kan Ilmaa addaan, kan Hafuura Qulqulluus addaan.

Haa ta'u iyyuu malee, Waaqayyummaan Abbaa, kan Ilmaa, kan Hafuura Qulqulluus tokko; ulfinatti, gooftummaatti, wal-qixxee ta'ee in jiraata. Ilmi jiraachuu Isaatti akka Abbaa ti, Hafuurri Qulqulluunis jiraachuu Isaatti akkasuma.

Abbaan hin uumamne, Ilmi hin uumamne, Hafuurri Qulqulluunis hin uumamne. Abbaan iddoo hundumaa jira, Ilmi iddoo hundumaa jira, Hafuurri Qulqulluunis iddoo hundumaa jira. Abbaan bara baraan jiraata, Ilmi bara baraan jiraata, Hafuurri Qulqulluunis bara baraan jiraata. Akkas yoo ta'e iyyuu bara baraan jiraataa kan ta'u kun tokko malee sadii miti. Kan hin uumamnee fi kan iddoo hundumaa jiru tokko akka ta'e, akkanuma immoo kan hin uumamnee fi kan iddoo hundumaa jiru sadii miti.

Akkuma kanatti Abbaan hundumaa kan danda'uu dha, Ilmi hundumaa kan danda'uu dha, Hafuurri Qulqulluunis hundumaa kan danda'uu dha. Haa ta'u iyyuu malee, hundumaa kan danda'u kun tokko malee sadii miti. Kanaafis Abbaan Waaqayyoo dha, Ilmi Waaqayyoo dha, Hafuurri Qulqulluunis Waaqayyoo dha. Akkas ta'u iyyuu Waaqayyo tokko malee, waaqayyoolii sadii miti. Kanaafis Abbaan Gooftaa dha, Ilmi Gooftaa dha, Hafuurri Qulqulluunis Gooftaa dha. Akkas ta'u iyyuu Gooftaa tokko malee, gooftota sadii miti.

Sababiin isaas dhugummaan Amantii Kristaanaa tokkoon tokkoon qaamichaa, Waaqayyo ta'uu Isaa fi Gooftaa ta'uu Isaa akka amannuuf akkuma nu dirqisiisutti, Amantiin Kristaanaa kun akka nuyi waaqayyoolii sadii yookiis gooftota sadii hin jenneefis nu dhowwa.

Abbaan eenyuun iyyuu hin hojjetamne, eenyuun iyyuu hin uumamne, eenyuttii iyyuu hin dhalanne. Ilmi Abbaattii dhalate malee, hin hojjetamne, hin uumamnes. Hafuurri Qulqulluun Abbaadhaa fi Ilma biraa kan ba'uudha malee, hin hojjetamne, hin uumamne, hin dhalannes.

Akkuma kanatti Abbaa tokkichatu jira malee, abbootii sadii miti; Ilma tokkichatu jira malee, ilmaan sadii miti; Hafuura Qulqulluu tokkichatu jira malee, hafuurota qulqulloota sadiitu jira miti. Qaama sadan kana keessaa inni tokko isa kaan dura yookiis isa kaan booddee miti; akkuma kanatti inni tokko isa kaan kan caalu yookiis isa kaanii gadi miti. Kanaafis qaamni sadan kun wal-qixxee ta'uu isaaniitii fi bara barummaatti tokko; kana irraa kan ka'e, akkuma kana duratti mul'ifamee dubbatametti, qaamni sadan kun Waaqayyummaatti tokko; Waaqayyo tokkos; qaamni sadan tokkummaa Waaqayyootti in waaqeffama. Namni fayyuu barbaadu hundinuu, waa'ee sadan tokkummaatiif akkuma kana yaaduun isaaf in ta'a.

Kana malees immoo fayyina bara baraa argachuudhaaf, nama ta'ee mul'achuu Gooftaa keenya Yesus Kristos garaa guutuudhaan amanuun barbaachisaa dha. Sababiin isaas Gooftaan keenya Yesus Kristos Ilmi Waaqayyoo, Waaqayyo ta'uu Isaa, nama ta'uu Isaas amanuunii fi dhugaa ba'uun amantii isa sirrii dha.

Inni baroota dura Abbaattii kan dhalate Waaqayyoo dha. Inni nama haadha Isaattii fooniin biyya lafaa irratti dhalatee dha. Inni nama lubbuu yaaduu danda'u qabuu fi foon namaa kan uffate, Waaqayyo mudaa hin qabnee fi nama mudaa hin qabnee dha. Waaqayyummaa Isaatiin Abbaadhaa wajjin waluma qixxee dha; namummaa Isaatiin immoo Abbaadhaa gadi.

Inni utuma Waaqayyoo fi nama dhugaa ta'ee jiruu iyyuu, Inni Kristos tokkicha malee, Kristos lama miti. Tokko yommuu jennu, foon namaa uffate jechuu keenya malee, Waaqayyummaa gara fooniitti geddare jechuu keenya miti. Dhugumaan tokko; tokko ta'uun Isaa qaama tokkotti tokko ta'udhaan malee, Waaqayyummaa Isaa fi namummaa Isaa walitti makuudhaan miti. Sababiin isaas foonii fi lubbuun yaaduu danda'u nama tokkicha akkuma ta'an, Waaqayyoo fi namni Kristos tokkicha ta'an.

Inni egaa fayyina keenyaaf jedhee kan dhiphate, Si'olitti kan gadi bu'e, du'aas kan ka'e; Gara waaqaattis kan ol ba'e, gara mirga Abbaa kan taa'u, warra jiranii fi warra du'anitti faraduudhaaf achii kan deebi'u; Yeroo dhufa Isaatti namoonni hundinuu fooniin du'aa ka'anii, waa'ee waan hojjetaniif deebii deebisuuf jiru. Wanta gaarii warri hojjetan, jireenya bara baraatti in galu; wanta hamaa warri hojjetan immoo gara ibidda bara baraatti in naqamu.

Kun Amantii Kristaanaa isa dhugaa dha; namni kana hin amannee fi jabeessee hin qabanne fayyuu hin danda'u.`,
      },
    ],
  },
  lordsPrayer: {
    title: "Kadhannaa Gooftaa",
    introduction:
      "Kadhannaa Gooftaa kadhannaa Yesuus bartoota isaa yeroo isaan kadhachuu nu barsiisi jedhanii isa gaafatan barsiisee dha. Kadhannaa kiristaanummaa keessatti beekamaa fi bal'inaan fayyadamaa dha.",
    text: `Yaa Abbaa keenyaa, waaqa irra kan jiraattu,
Maqaan Kee haa qulqullaa'u,
Mootummaan Kee haa dhufu,
Jaalalli Kee waaqa irratti akka ta'u,
Akkasuma lafa irratti haa ta'u;
Kan nu ga'u buddeena keenya har'aa nuuf kenni,
Yakka keenya nuuf dhiisi;
Nuyis kan nu yakkaniif akkuma dhiifnu,
Qoramatti nu hin galchin;
Hamaa nu oolchi malee,
Mootummaan kan Kee ti'oo,
Humnis, galannis, baruma baraan. Ameen!`,
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
