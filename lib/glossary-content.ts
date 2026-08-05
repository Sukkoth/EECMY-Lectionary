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
// Amharic content
// ---------------------------------------------------------------------------

const amharicContent: GlossaryContent = {
  lectionary: {
    title: "ሥርዓተ ንባብ (ሌክቲዮናሪ)",
    sections: [
      {
        heading: "«ሌክቲዮናሪ» ማለት ምን ማለት ነው?",
        body: `«ሌክቲዮናሪ» የሚለው ቃል «lectionarium» ከተባለው የላቲን ቃል የተገኘ ሲሆን ትርጉሙም «የንባብ መጽሐፍ» ማለት ነው። ሌክቲዮናሪ በክርስቲያናዊ የአምልኮ ሥርዓት ውስጥ ጥቅም ላይ እንዲውል በልዩ ተစဉ်ኖ የተዘጋጀ የመጽሐፍ ቅዱስ ንባቦች ስብስብ ነው። ክፍሎችን በዘፈቀደ ከመምረጥ ይልቅ፥ ሌክቲዮናሪ ዓመቱን ሙሉ የእግዚአብሔርን ቃል በሥርዓትና በቅደም ተከተል እንድናጠና ይረዳናል።`,
      },
      {
        heading: "አብያተ ክርስቲያናት ሌክቲዮናሪን ለምን ይጠቀማሉ?",
        body: `አብያተ ክርስቲያናት ሌክቲዮናሪን የሚጠቀሙት ምእመናን በጊዜ ሂደት የተለያዩ የመጽሐፍ ቅዱስ ክፍሎችን እንዲሰሙ ለማድረግ ነው። በጥንቃቄ የተዘጋጀ ሌክቲዮናሪ አምላኪዎችን ከፍጥረት እስከ ራእይ ካሉት ዋና ዋና የመጽሐፍ ቅዱስ ርዕሶች ጋር ያስተዋውቃቸዋል። በተጨማሪም አገልጋዮች በዓለም ዙሪያ ካሉ ክርስቲያኖች ጋር በተመሳሳይ ቀን የሚነበቡትን መልእክቶች እንዲያስተምሩ ይረዳቸዋል።`,
      },
      {
        heading: "ሌክቲዮናሪ የቤተ ክርስቲያንን ዓመት እንዴት ይከተላል?",
        body: `ሌክቲዮናሪ የቤተ ክርስቲያን ዘመን (የሥርዓተ አምልኮ ካሌንደር) ጋር በጥብቅ የተያያዘ ነው። ይህም ካሌንደር የክርስቶስን ምድራዊ ሕይወትና የቤተ ክርስቲያንን ሁነቶች መሠረት ያደርጋል። ለምሳሌ በአድቬንት (ጾመ ነቢያት) ወቅት ንባቦቹ በጽኑ ተስፋና በመጠባበቅ ላይ ያተኩራሉ። በዐብይ ጾም ወቅት ደግሞ ወደ ንስሐና ወደ መስቀሉ ጉዞ ያደላሉ።`,
      },
      {
        heading: "ንባቦች እንዴት ተደራጅተዋል?",
        body: `በዚህ መተግበሪያ ውስጥ ያለው ሌክቲዮናሪ በየዕለቱ ሦስት የንባብ ክፍሎችን ያቀርባል፦

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
        heading: "በዚህ መተግበሪያ ውስጥ ሌክቲዮናሪን እንዴት መጠቀም ይቻላል?",
        body: `ይህ መተግበሪያ በተመረጠው ቋንቋና የመጽሐፍ ቅዱስ ትርጉም መሠረት የዕለት ንባቦችን ያቀርባል። በመደበኛ ቀናት የዕለቱን ንባብ ያገኛሉ። በእሁድና በበዓላት ደግሞ ብሉይ ኪዳን፥ መልእክት እና ወንጌል ተዘጋጅተው ይቀርባሉ። የካሌንደር ገጽን በመጠቀም የማንኛውንም ቀን ንባብ መመልከት እና የተወደዱ ጥቅሶችን ማስቀመጥ ይችላሉ።`,
      },
    ],
  },
  churchYear: {
    title: "የቤተ ክርስቲያን ዓመት",
    intro: `የቤተ ክርስቲያን ዓመት (የሥርዓተ አምልኮ ካሌንደር) የክርስቲያኖችን ዓመታዊ የመንፈሳዊ ሕይወት ጉዞ የሚያደራጅ የዘመናትና የበዓላት አውድ ነው። እያንዳንዱ ዘመን ምእመናንን ከክርስቶስ ልደት እስከ ትንሣኤና እስከ ቤተ ክርስቲያን ሕይወት የሚያመላክት ልዩ መንፈሳዊ ዓላማ አለው።`,
    seasons: [
      {
        name: "አድቬንት (ጾመ ነቢያት)",
        purpose: "የክርስቶስን ልደት ለማክበር የሚደረግ የዝግጅትና የጽኑ ተስፋ ዘመን።",
        theme: "ተስፋ፥ መጠባበቅ እና የመሲሑ ምጽአት",
        duration: "4 ሳምንታት (ከኖቬምበር 30 አቅራቢያ ካለው እሑድ ጀምሮ)",
      },
      {
        name: "ክሪስማስ (ልደት)",
        purpose: "የእግዚአብሔር ሰው መሆንና የኢየሱስ ክርስቶስ ልደት የሚከበርበት ታላቅ በዓል።",
        theme: "ቃሉም ሥጋ ሆነ — አምላክ ወደ ሰው ታሪክ ገባ",
        duration: "12 ቀናት (ከዲሴምበር 25 እስከ ጃንዋሪ 5)",
      },
      {
        name: "ኤፒፋኒ (ከተራ/ጥምቀት)",
        purpose: "ክርስቶስ ለዓለም ሁሉ መድኃኒት ሆኖ መገለጡ የሚታሰብበት ዘመን።",
        theme: "ክርስቶስ የአሕዛብ ሁሉ ብርሃን ሆኖ ተገለጠ",
        duration: "ከጃንዋሪ 6 እስከ ዐብይ ጾም ዋዜማ",
      },
      {
        name: "ዐብይ ጾም (ሌንት)",
        purpose: "ለፋሲካ በዓል ለመዘጋጀት የሚደረግ የንስሐ፥ የጸሎትና የራስን የመመርመር ዘመን።",
        theme: "ንስሐ፥ መስዋዕትነት እና ወደ መስቀሉ የሚደረግ ጉዞ",
        duration: "40 ቀናት (እሑዶችን ሳይጨምር)",
      },
      {
        name: "ቅዱስ ሳምንት (ሕማማት)",
        purpose: "የክርስቶስን ምድራዊ ሕይወት የመጨረሻ ቀናት የምናስብበት እጅግ ቅዱስ ሳምንት።",
        theme: "የክርስቶስ ሕማማት፥ ሞት እና ድል አድራጊነት",
        duration: "1 ሳምንት (ከሆሣዕና እስከ ቅዳሜ ሥዑር)",
      },
      {
        name: "ፋሲካ (ኤስተር/ትንሣኤ)",
        purpose: "የክርስቲያን እምነት መሠረት የሆነውን የክርስቶስን ከሙታን መነሣት የምናከብርበት የደስታ ዘመን።",
        theme: "ትንሣኤ፥ አዲስ ሕይወት እና በሞት ላይ የተገኘ ድል",
        duration: "50 ቀናት (ከትንሣኤ እሑድ እስከ ጴንጠቆስጤ)",
      },
      {
        name: "ጴንጠቆስጤ",
        purpose: "መንፈስ ቅዱስ በደቀ መዛሙርቱ ላይ የወረደበት እና ቤተ ክርስቲያን የተመሠረተችበት ቀን።",
        theme: "መንፈስ ቅዱስ፥ የቤተ ክርስቲያን ልደት እና የእግዚአብሔር ቃል ኃይል",
        duration: "1 ቀን (ከትንሣኤ በኋላ በ50ኛው ቀን)",
      },
      {
        name: "የሥላሴ ዘመን (መደበኛ ዘመን)",
        purpose: "በእምነትና በደቀ መዝሙርነት የማደግ፥ በክርስቶስ ትምህርትና ሥራ ላይ የማተኮር ዘመን።",
        theme: "የቤተ ክርስቲያን ሕይወት፥ ደቀ መዝሙርነት እና የክርስቶስ መንግሥት",
        duration: "ከጴንጠቆስጤ በኋላ እስከ አድቬንት ድረስ ያለው ረጅሙ ዘመን",
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
        text: `ሁሉን በሚችል ሰማይንና ምድርን በፈጠረ በእግዚአብሔር አብ አመናለሁ።

በአንድ ልጁም በጌታችን በኢየሱስ ክርስቶስ አመናለሁ፤
እርሱ ከመንፈስ ቅዱስ ተፀንሶ ከድንግል ማርያም ተወለደ፤
በጴንጤናዊው ጲላጦስ ዘመን መከራን ተቀበለ፤
ተሰቀለ፤ ሞተ፤ ተቀበረ፤ ወደ ሲኦል ወረደ፤
በሦስተኛውም ቀን ከሙታን ተለይቶ ተነሣ፤
ወደ ሰማይ አረገ፤
ሁሉን በሚችል በእግዚአብሔር አብ ቀኝ ተቀመጠ፤
ከዚያም በሕያዋንና በሙታን ላይ ሊፈርድ ይመጣል።

ከመንፈስ ቅዱስ፥
ከቅድስት አጽናፋዊት ቤተ ክርስቲያን፥
ከቅዱሳን ኅብረት፥
ከኃጢአት ይቅርታ፥
ከሥጋ ትንሣኤና ከዘላለም ሕይወት አመናለሁ።
አሜን።`,
      },
      {
        name: "ጸሎተ ሃይማኖት (Nicene Creed)",
        introduction:
          "ጸሎተ ሃይማኖት በኒቂያ (325 ዓ.ም) እና በቁስጥንጥንያ (381 ዓ.ም) ጉባኤዎች የተደነገገ የሃይማኖት መግለጫ ሲሆን በብዙ አብያተ ክርስቲያናት በአምልኮ ጊዜ ይጸለያል።",
        text: `ሁሉን በያዘ ሰማይንና ምድርን የሚታየውንና የማይታየውን በፈጠረ በአንድ አምላክ በእግዚአብሔር አብ አመናለሁ።

ዓለም ሳይፈጠር ከእርሱ ጋር በነበረ በአንድ ጌታ በኢየሱስ ክርስቶስ አመናለሁ፤
ከአምላክ የተገኘ አምላክ፥ ከብርሃን የተገኘ ብርሃን፥ እውነተኛ አምላክ የተገኘ እውነተኛ አምላክ፥ የተወለደ እንጂ ያልተፈጠረ፥ በባሕርዩ ከአብ ጋር የሚስተካከል፤
ሁሉ በእርሱ ሆነ፥ ያለ እርሱ ግን ምንም የሆነ የለም።
ስለ እኛ ስለ ሰዎች ስለ መዳናችን ከሰማይ ወረደ፤
ከመንፈስ ቅዱስና ከድንግል ማርያም ሰው ሆነ፤
ስለ እኛ በጴንጤናዊው ጲላጦስ ዘመን ተሰቀለ፤ መከራን ተቀበለ፤ ሞተ፤ ተቀበረ፤
በቅዱሳት መጻሕፍት እንደተጻፈ በሦስተኛው ቀን ከሙታን ተለይቶ ተነሣ፤
ወደ ሰማይ አረገ፥ በአባቱም ቀኝ ተቀመጠ፤
በሕያዋንና በሙታን ላይ ሊፈርድ በጌትነት እንደገና ይመጣል፤
ለመንግሥቱም ፍጻሜ የለውም።

ከአብ በሚወጣ ከአብና ከወልድ ጋር አብሮ በሚሰገድለትና በሚመሰገንበት፥ በነቢያትም ሲናገር በነበረ ጌታና ሕይወትን በሚሰጥ በመንፈስ ቅዱስ አመናለሁ።
በሁሉ በምትሆን በአንዲት ቅድስት አጽናፋዊትና ሐዋርያዊት ቤተ ክርስቲያን አመናለሁ።
ለኃጢአት ይቅርታ በአንዲት ጥምቀት አመናለሁ፤
የሙታንንም ትንሣኤና የሚመጣውን የዘላለም ሕይወት ተስፋ አደርጋለሁ።
አሜን።`,
      },
      {
        name: "የአትናቴዎስ ሃይማኖት (Athanasian Creed)",
        introduction:
          "የአትናቴዎስ የሃይማኖት መግለጫ በቅዱስ አትናቴዎስ ስም የሚጠራ ጥንታዊ መግለጫ ሲሆን ስለ ሥላሴ ምስጢርና ስለ ክርስቶስ ሰው መሆን በስፋት ያብራራል።",
        text: `የሚድን ዘንድ የሚወድ ሁሉ ከሁሉ በፊት አጽናፋዊቷን ሃይማኖት ሊጠብቅ ይገባዋል። እርሷንም ሙሉና ንጹሕ አድርጎ የማይጠብቅ ሁሉ ያለ መጠራጠር ለዘላለም ይጠፋል።

አጽናፋዊቷም ሃይማኖት ይህች ናት፦ በአንድ አምላክ በሥላሴ፥ በሥላሴም በአንድነት እንሰግዳለን፤ አካላትን ሳንቀላቅል፥ ባሕርይንም ሳንከፍል፤ አብ አንድ አካል ነውና፥ ወልድም ሌላ አካል ነው፥ መንፈስ ቅዱስም ሌላ አካል ነው። ነገር ግን የአብና የወልድ የመንፈስ ቅዱስም አምላክነት አንድ ነው፤ ክብራቸው እኩል ነው፥ ጌትነታቸውም አብሮ የሚኖር ነው።

አብ እንደሆነ ወልድም እንዲሁ ነው፥ መንፈስ ቅዱስም እንዲሁ ነው። አብ ያልተፈጠረ ነው፥ ወልድ ያልተፈጠረ ነው፥ መንፈስ ቅዱስም ያልተፈጠረ ነው። አብ ወሰን የሌለው ነው፥ ወልድ ወሰን የሌለው ነው፥ መንፈስ ቅዱስም ወሰን የሌለው ነው። አብ ዘለዓለማዊ ነው፥ ወልድ ዘለዓለማዊ ነው፥ መንፈስ ቅዱስም ዘለዓለማዊ ነው። ነገር ግን አንድ ዘለዓለማዊ እንጂ ሦስት ዘለዓለማውያን አይደሉም።

እንዲሁም ሦስት ያልተፈጠሩ ወይም ሦስት ወሰን የሌላቸው አይደሉም፤ አንድ ያልተፈጠረና አንድ ወሰን የሌለው ነው እንጂ። አሜን።`,
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
    seasons: [
      {
        name: "Advent (Eeggannoo)",
        purpose: "Dhaloota Kiristoos kabajuuf qophii fi abdiidhaan eeggachuuf bara dhihaatu.",
        theme: "Abdiu, eeggannoo fi dhufaatii Masiihichaati",
        duration: "Torban 4 (Mudde dura torban Dilbata irraa jalqaba)",
      },
      {
        name: "Ayyaana Dhalootaa (Kristmas)",
        purpose: "Waaqayyo nama ta'ee dhalachuu Yesuus Kiristoos kabajuu.",
        theme: "Dubbiin foon ta'e — Waaqayyo seenaa namaa keessa gale",
        duration: "Guyyoota 12 (Mudde 25 hanga Ammajjii 5)",
      },
      {
        name: "Epiphany (Muldhina/Cuuphaa)",
        purpose: "Kiristoos addunyaa hundaaf fayyisaa ta'ee mul'achuu isaa yaadachuu.",
        theme: "Kiristoos ifa saba hundaaf ta'ee mul'ate",
        duration: "Ammajjii 6 irraa hanga Sooma Guddaa ዋዜማቲ",
      },
      {
        name: "Sooma Guddaa (Lent)",
        purpose: "Ayyaana Fannoo fi Du'a Ka'uuf qopha'uuf gaabbii fi kadhannaaf bara dhihaatu.",
        theme: "Gaabbii, aarsaa fi gara fannoo deemuun",
        duration: "Guyyoota 40 (Dilbata osoo hin dabalamin)",
      },
      {
        name: "Torban Qulqulluu (Holy Week)",
        purpose: "Guyyoota dhumaa jireenya Kiristoos lafa irraa yaadachuuf torban qulqulluu.",
        theme: "Rakkina, du'a fi mo'icha Kiristoos",
        duration: "Torban 1 (Dilbata Hoosaa'inaa irraa hanga Sanbata Guddaatti)",
      },
      {
        name: "Fannoo fi Du'a Ka'uu (Easter)",
        purpose: "Kiristoos du'a mo'ee ka'uu isaa gammachuudhaan kabajuu — hundee amantaa kiristaanaa.",
        theme: "Du'a ka'uu, jireenya haarawa fi mo'icha du'a irratti",
        duration: "Guyyoota 50 (Dilbata Easter irraa hanga Shantaffaatti)",
      },
      {
        name: "Pentecost (Shantaffaa)",
        purpose: "Hafuurni Qulqulluun bartoota irratti bu'uu fi waldaan dhalachuu ishee yaadachuu.",
        theme: "Hafuura Qulqulluu, dhaloota waldaa fi humna Dubbii Waaqayyoo",
        duration: "Guyyaa 1 (Guyyaa 50ffaa Easter irrah)",
      },
      {
        name: "Bara Sillaasee (Trinity Season)",
        purpose: "Amantaa fi bartummaadhaan guddachuuf, barumsa Kiristoos irratti xiyyeeffachuu.",
        theme: "Jireenya waldaa, bartummaa fi mootummaa Kiristoos",
        duration: "Bara dheeraa Shantaffaa irraa hanga Advent-tti dhihaatu",
      },
    ],
  },
  creeds: {
    title: "Ibsa ejjennaa Amantaa",
    creeds: [
      {
        name: "Amanaa Apostoloota (Apostles' Creed)",
        introduction:
          "Amanaa Apostoloota ibsa amantaa kiristaanaa isa antique fi bal'inaan fayyadamaa dha. Tajaajila sagadaa, cuuphaa fi kadhanna keessatti deebi'ee dubbatama.",
        text: `Waaqayyo Abbaa danda'aa hundumaa,
isa waaqaa fi lafa uumetti nan amana.

Ilma isaa tokkicha Gooftaa keenya Yesuus Kiristoosittis nan amana.
Inni Hafuura Qulqulluudhaan ulfaa'ee,
Durboo Maariyaam irraa dhalate.
Phonxos Philaaxos jalattis rakkina arge,
fannifame, du'e, awwaalames;
gara iddoo du'aattis gad bu'e.
Guyyaa sadaffaatti du'a ka'e,
gara waaqatti ol ba'e.
Waaqayyo Abbaa danda'aa hundumaa mirga taa'e.
Achillasaas warra jiraatotaa fi warra du'an irratti murteessuuf ni dhufa.

Hafuura Qulqulluutti,
Waldaa Qulqulluu,
tokkummaa qulqullootaatti,
dhiifama cubbuutti,
du'a ka'uu fooniitiifi jireenya bara baraatti nan amana.
Ameen.`,
      },
      {
        name: "Amanaa Nikiya (Nicene Creed)",
        introduction:
          "Amanaa Nikiya ibsa amantaa Kora Nikiya (325 AD) fi Kora Kaanstaantiinoopil (381 AD) irratti murtaa'ee dha.",
        text: `Waaqayyo Abbaa tokkicha isa danda'aa hundumaa,
isa waaqaa fi lafa, waan mul'atuufi waan hin mul'anne hundumaa uumetti ni amanna.

Gooftaa tokkicha Yesuus Kiristoos, Ilma Waaqayyoo tokkicha,
barri osoo hin jalqabin Abbaa irraa dhalatetti ni amanna.
Waaqa irraa Waaqa, Ifa irraa Ifa,
Waaqa dhugaa irraa Waaqa dhugaa,
kan dhalate malee kan hin uumamne,
Abbaa waliin amala tokko kan qabu,
inni waan hundumaa uume.
Nuuf jedhee nu fayyisuuf waaqarraa gad bu'e.
Hafuura Qulqulluu fi Durboo Maariyaam irraa foon uffate,
nama dhugaas ta'e.
Nuuf jedhee Phalaaxos jalatti fannifame, du'e, awwaalame.
Akka Kitaabni Qulqulluun jedhutti guyyaa sadaffaatti du'a ka'e.
Gara waaqatti ol ba'e, mirga Abbaa taa'e.
Warra jiraatotaa fi du'an irratti murteessuuf ulfinaan deebi'ee ni dhufa;
mootummaan isaas dhuma hin qabu.

Hafuura Qulqulluu, Gooftaa fi Arjoomaa jireenyaa,
isa Abbaa irraa ba'u,
isa Abbaa fi Ilma waliin sagadamuufi ulfeeffamu,
isa raajotaan dubbatetti ni amanna.
Waldaa Qulqulluu tokkitti, hunda galeessa fi kan apostolootaatti ni amanna.
Dhiifama cubbuutiif cuuphaa tokkitti ni beekna.
Du'a ka'uu warra du'anii fi jireenya bara dhufuuf eegganna.
Ameen.`,
      },
      {
        name: "Amanaa Atanaatewos (Athanasian Creed)",
        introduction:
          "Amanaa Atanaatewos ibsa amantaa qulqulluu Atanaatewosiin kenname yoo ta'u, Sillaasee fi qulqullummaa Kiristoos bal'inaan ibsa.",
        text: `Namni fayyuu fedhu kamiyyuu, waan hundumaa dura amantaa qulqulluu sanas qabachuu qaba. Isas osoo hin hir'isin qulqullummaadhaan kan hin eegne, dhabama malee bara baraaf ni bada.

Amantaan qulqulluun isaniis kana: Waaqa tokko Sillaaseedhaan, Sillaasees tokkummaadhaan sagadna. Qaamota osoo hin walitti makin, amalas osoo hin qoodin. Abbaan qaama tokko, Ilmis qaama biraa, Hafuurri Qulqulluuns qaama biraa dha. Garuu Waaqayyummaan Abbaa, Ilmaa fi Hafuura Qulqulluu tokko, ulfinni isaanii qixxee, surraan isaaniis bara baraaf tokko.

Abbaan akkuma ta'e, Ilmis akkasuma, Hafuurri Qulqulluuns akkasuma. Abbaan kan hin uumamne, Ilmis kan hin uumamne, Hafuurri Qulqulluuns kan hin uumamne. Abbaan daangaa kan hin qabne, Ilmis daangaa kan hin qabne, Hafuurri Qulqulluuns daangaa kan hin qabne. Abbaan bara baraa, Ilmis bara baraa, Hafuurri Qulqulluuns bara baraa. Garuu bara baraa tokko malee bara baraa sadii miti. Ameen.`,
      },
    ],
  },
  lordsPrayer: {
    title: "Kadhannaa Gooftaa",
    introduction:
      "Kadhannaa Gooftaa kadhannaa Yesuus bartoota isaa yeroo isaan kadhachuu nu barsiisi jedhanii isa gaafatan barsiisee dha. Kadhannaa kiristaanummaa keessatti beekamaa fi bal'inaan fayyadamaa dha.",
    text: `Yaa Abbaa keenya isa waaqa irra jirtuu,
Maqaan kee qulqulluu ta'ee haa eebbifamu.
Mootummaan kee haa dhufu,
Feeteen kee akkuma waaqa irratti ta'u,
akkasuma lafa irratti haa ta'u.
Buddeena keenya kan guyyaa har'aa nuu kenni.
Akkuma nuti warra nu yakkaniif dhiisnu,
yakka keenyas nuu dhiisi.
Qormaata keessattis nu hin galchin,
hamaa irraa nu oolchi malee.
Mootummaan, humni, ulfinnis bara baraaf kan keeti.
Ameen.`,
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
