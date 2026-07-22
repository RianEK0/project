const CURRENT_DATE = new Date("2026-07-22T21:00:00+07:00");
export const CURRENT_DATE_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(CURRENT_DATE);

export const brand = {
  name: "Noctra",
  headline: "Discover songs through moods, stories, weather, and the nights that stay with you.",
  subheadline:
    "A global emotional music community built for people who remember what they felt when a song found them.",
};

export const moods = [
  { label: "Love", emoji: "❤️", aura: "Warm bloom" },
  { label: "Heartbreak", emoji: "💔", aura: "Tender ache" },
  { label: "Sad", emoji: "🌧", aura: "Soft rain" },
  { label: "Lonely", emoji: "🌙", aura: "Night city" },
  { label: "Missing Someone", emoji: "🥺", aura: "Lingering memory" },
  { label: "Healing", emoji: "🌸", aura: "Gentle sunrise" },
  { label: "Happy", emoji: "😊", aura: "Bright pulse" },
  { label: "Motivation", emoji: "🔥", aura: "Forward energy" },
  { label: "Driving", emoji: "🚗", aura: "Open roads" },
  { label: "Coffee", emoji: "☕", aura: "Cafe calm" },
  { label: "Beach", emoji: "🌊", aura: "Salt air" },
  { label: "Study", emoji: "📚", aura: "Focus flow" },
  { label: "Sleep", emoji: "😴", aura: "Dream drift" },
  { label: "Sunset", emoji: "🌅", aura: "Golden hour" },
  { label: "Midnight", emoji: "🌌", aura: "Neon skyline" },
  { label: "Rain", emoji: "🌧", aura: "Window reflections" },
  { label: "Party", emoji: "🎉", aura: "After dark" },
  { label: "Chill", emoji: "🎧", aura: "Floating haze" },
  { label: "Acoustic", emoji: "🎸", aura: "Wood and wire" },
];

const moodToGenres = {
  Love: ["Dream Pop", "Alt R&B", "Acoustic Folk", "Soul Pop"],
  Heartbreak: ["Piano Pop", "Acoustic Folk", "Soft Rock", "Lo-fi Soul"],
  Sad: ["Ambient", "Indie Pop", "Lo-fi Soul", "Neo Classical"],
  Lonely: ["Synthwave", "Dream Pop", "Neo Jazz", "Alt R&B"],
  "Missing Someone": ["Piano Pop", "Dream Pop", "Acoustic Folk", "Soft Rock"],
  Healing: ["Ambient", "Indie Folk", "Neo Jazz", "Soul Pop"],
  Happy: ["Dance Pop", "City Pop", "Disco Pop", "Indie Pop"],
  Motivation: ["Electronic", "Arena Pop", "Hip-Hop Soul", "Alt Rock"],
  Driving: ["Synthwave", "Alt Rock", "Electronic", "Indie Pop"],
  Coffee: ["Neo Jazz", "Lo-fi Soul", "Acoustic Folk", "Indie Folk"],
  Beach: ["Tropical House", "Reggae Pop", "Indie Pop", "Dance Pop"],
  Study: ["Lo-fi Beats", "Ambient", "Neo Classical", "Instrumental"],
  Sleep: ["Ambient", "Dream Pop", "Cinematic Instrumental", "Neo Classical"],
  Sunset: ["City Pop", "Chillwave", "Soul Pop", "Dream Pop"],
  Midnight: ["Synthwave", "Alt R&B", "Neo Jazz", "Chillwave"],
  Rain: ["Piano Pop", "Lo-fi Soul", "Ambient", "Dream Pop"],
  Party: ["Dance Pop", "Electronic", "Funk Pop", "Alt Pop"],
  Chill: ["Chillwave", "Lo-fi Beats", "Dream Pop", "Neo Jazz"],
  Acoustic: ["Acoustic Folk", "Unplugged Pop", "Indie Folk", "Soft Rock"],
};

const languageConfigs = [
  {
    language: "Indonesian",
    count: 250,
    countries: ["Indonesia"],
    titleLead: ["Senja", "Rindu", "Langit", "Hujan", "Pulang", "Diam", "Peluk", "Malam", "Cahaya", "Ruang", "Bintang", "Luka"],
    titleConnector: ["di", "tanpa", "untuk", "setelah", "sebelum", "menuju", "antara", "dalam"],
    titleTail: ["Jakarta", "Jendela Basah", "Kopi Dingin", "Kota Hening", "Langkahmu", "Pagi Terakhir", "Halaman Rumah", "Suara Ombak", "Arah Selatan", "Rindu Lama", "Musim Baru", "Langit Biru"],
    artistsFirst: ["Alya", "Reza", "Nadin", "Rafi", "Salma", "Arga", "Mira", "Bima", "Saskia", "Elio"],
    artistsLast: ["Pratama", "Rahman", "Mahesa", "Wijaya", "Putri", "Saputra", "Lestari", "Azzahra", "Nugroho", "Kirana"],
    albumLead: ["Ruang", "Musim", "Pendar", "Kisah", "Orbit", "Pelabuhan", "Nada", "Layar", "Pijar", "Aroma", "Pintu", "Gelombang"],
    albumTail: ["Hening", "Tengah Malam", "Pulang", "Setelah Hujan", "Kota Lama", "Selatan", "Pertama", "Tak Selesai", "Yang Hilang", "Kedua", "Diam", "Senandika"],
    genreBoosts: ["Indo Pop", "Alternative Pop", "Folk Pop"],
  },
  {
    language: "English",
    count: 250,
    countries: ["United States", "United Kingdom", "Canada", "Australia"],
    titleLead: ["Neon", "Velvet", "Golden", "Midnight", "Crimson", "Static", "Silver", "Paper", "Electric", "Fading", "Mercury", "Wild"],
    titleConnector: ["after", "before", "under", "inside", "without", "through", "across", "between"],
    titleTail: ["Rain", "The City", "Firelight", "Our Exit", "Gravity", "Mirrors", "Summer", "Signals", "Low Tide", "The Silence", "Blue Smoke", "Headlights"],
    artistsFirst: ["Avery", "Lena", "Miles", "Jade", "Theo", "Nova", "Mason", "Ivy", "Julian", "Skye"],
    artistsLast: ["Hart", "Vale", "Rivers", "Monroe", "Sterling", "Bennett", "Rowe", "Hayes", "Briar", "Quinn"],
    albumLead: ["Cinema", "Afterglow", "Monsoon", "Satellite", "Velvet", "Static", "Nightfall", "Mirage", "Echo", "Contour", "Parallax", "Aurora"],
    albumTail: ["Archive", "Season", "Tapes", "Diaries", "Hotel", "Drive", "Atlas", "Letters", "Blueprint", "Dreams", "Edition", "Currents"],
    genreBoosts: ["Alt Pop", "Indie Pop", "Soul Pop"],
  },
  {
    language: "Korean",
    count: 100,
    countries: ["South Korea"],
    titleLead: ["Bichi", "Bam", "Sora", "Baram", "Miso", "Bimil", "Geot", "Byeol", "Maum", "Nuneul", "Bada", "Cheot"],
    titleConnector: ["ui", "gateun", "ane", "biche", "sok", "kkeute", "neomeo", "sai"],
    titleTail: ["Geori", "Bichulgi", "Bitbam", "Sigan", "Pado", "Sori", "Jangmabi", "Yeoreum", "Gieok", "Neowa", "Dasi", "Maeum"],
    artistsFirst: ["Yuna", "Min", "Haneul", "Jisoo", "Taemin", "Sora", "Hyun", "Ara", "Joon", "Nari"],
    artistsLast: ["Kim", "Park", "Lee", "Choi", "Seo", "Han", "Jung", "Kang", "Yoon", "Shin"],
    albumLead: ["Blue", "Moon", "Seoul", "Neon", "Dream", "Signal", "After", "Echo", "Velvet", "Mirae", "Cloud", "Dawn"],
    albumTail: ["Diary", "Night", "Garden", "Window", "Line", "Bloom", "Step", "Room", "Edition", "Scene", "Letter", "Memory"],
    genreBoosts: ["K-Indie", "K-R&B", "K-Pop Alternative"],
  },
  {
    language: "Japanese",
    count: 80,
    countries: ["Japan"],
    titleLead: ["Yoru", "Hikari", "Natsu", "Ame", "Kokoro", "Sora", "Kage", "Hoshi", "Shizuka", "Mirai", "Kaze", "Ao"],
    titleConnector: ["no", "to", "e", "kara", "made", "ni", "de", "yori"],
    titleTail: ["Mado", "Tokyo", "Koe", "Kioku", "Nagare", "Umi", "Kaori", "Kisetsu", "Michi", "Yubisaki", "Kimi", "Tsuki"],
    artistsFirst: ["Aoi", "Ren", "Mika", "Haru", "Sena", "Kaito", "Yui", "Hinata", "Riku", "Mei"],
    artistsLast: ["Sato", "Tanaka", "Watanabe", "Suzuki", "Kobayashi", "Yamamoto", "Ito", "Nakamura", "Kato", "Mori"],
    albumLead: ["Moon", "Tokyo", "Sakura", "Transit", "River", "Pixel", "Shadow", "Prism", "Sunday", "Echo", "Quiet", "Mirage"],
    albumTail: ["Notebook", "Signal", "Bloom", "Stories", "Circuit", "Dawn", "Steps", "Fragments", "Blue", "Letters", "Map", "Tides"],
    genreBoosts: ["City Pop", "J-Rock", "J-Indie"],
  },
  {
    language: "Malay",
    count: 40,
    countries: ["Malaysia"],
    titleLead: ["Malam", "Rindu", "Hujan", "Bintang", "Detik", "Bayang", "Hati", "Langkah", "Pulang", "Warna", "Sinar", "Bulan"],
    titleConnector: ["di", "tanpa", "untuk", "antara", "selepas", "menuju", "dalam", "sebelum"],
    titleTail: ["Kuala Lumpur", "Tingkap Basah", "Senyuman", "Lorong Sunyi", "Laut Timur", "Subuh", "Arahmu", "Kenangan", "Jalan Raya", "Pelabuhan", "Pelita", "Embun"],
    artistsFirst: ["Aina", "Hakim", "Sara", "Rayyan", "Nadia", "Irfan", "Dhia", "Faris", "Eisha", "Zaf"],
    artistsLast: ["Rahim", "Halim", "Azman", "Syah", "Nordin", "Hakim", "Zahra", "Faiz", "Rizal", "Mahfuz"],
    albumLead: ["Pelangi", "Cahaya", "Mimpi", "Orbit", "Pesisir", "Horizon", "Nada", "Ruang", "Musim", "Pijar", "Kelana", "Kertas"],
    albumTail: ["Malam", "Biru", "Pertama", "Kedua", "Hujan", "Terakhir", "Selatan", "Tenang", "Yang Hilang", "Mekar", "Pulang", "Diari"],
    genreBoosts: ["Malay Pop", "Indie Folk", "Soul Pop"],
  },
  {
    language: "Thai",
    count: 30,
    countries: ["Thailand"],
    titleLead: ["Fah", "Ratri", "Fon", "Sang", "Ruk", "Klai", "Dao", "Lom", "Saeng", "Baan", "Khwam", "Khwamfan"],
    titleConnector: ["nai", "bon", "klang", "lang", "kon", "kap", "jak", "thueng"],
    titleTail: ["Bangkok", "Soi Nao", "Khwamngao", "Tuachai", "Mueang", "Rimtang", "Rao", "Talay", "Ropfai", "Khwamjam", "Miti", "Muenkan"],
    artistsFirst: ["Nara", "Pim", "Korn", "Tawan", "Mali", "Anan", "Sai", "Mek", "Kanya", "Niran"],
    artistsLast: ["Suk", "Phan", "Rattan", "Chai", "Wong", "Kiet", "Silp", "Preecha", "Kul", "Siri"],
    albumLead: ["Neon", "Siam", "River", "Lantern", "Mirror", "Pulse", "Shadow", "Skyline", "Golden", "Echo", "Lagoon", "Bloom"],
    albumTail: ["Letters", "Scene", "Room", "Stories", "Night", "Tides", "Replay", "Glass", "Map", "Diary", "Motion", "Memory"],
    genreBoosts: ["Thai Pop", "Synth Pop", "Indie Pop"],
  },
  {
    language: "Mandarin",
    count: 30,
    countries: ["China"],
    titleLead: ["Ye", "Guang", "Hai", "Xin", "Yun", "Feng", "Lu", "Yue", "Lan", "Wu", "Shi", "Chen"],
    titleConnector: ["de", "zai", "yu", "xiang", "he", "zhi", "hou", "qian"],
    titleTail: ["Chengshi", "Yuhou", "Jiyi", "Shengyin", "Haidi", "Xiawu", "Dengguang", "Wenrou", "Mingxin", "Huilai", "Qiaobian", "Miti"],
    artistsFirst: ["Lina", "Wei", "Yao", "Chen", "Ming", "Xuan", "Rui", "Jing", "Han", "Qiao"],
    artistsLast: ["Lin", "Zhou", "Zhang", "Wu", "Xu", "Huang", "Guo", "Liang", "Sun", "Cai"],
    albumLead: ["Moon", "Metro", "Silk", "Echo", "Aurora", "Velvet", "Harbor", "Season", "Glass", "Signal", "Jade", "Bloom"],
    albumTail: ["River", "Notebook", "Letters", "Dream", "Circuit", "Tides", "Night", "Memory", "Edition", "Sketch", "Window", "Spectrum"],
    genreBoosts: ["Mandopop", "Dream Pop", "Electronic Pop"],
  },
  {
    language: "Hindi",
    count: 40,
    countries: ["India"],
    titleLead: ["Raat", "Dil", "Safar", "Barsaat", "Khwaab", "Saaya", "Awaaz", "Manzil", "Sitam", "Pal", "Roshni", "Dariya"],
    titleConnector: ["ke", "mein", "bina", "baad", "pehle", "saath", "paar", "andar"],
    titleTail: ["Mumbai", "Yaadein", "Sheher", "Raaste", "Tera Naam", "Aakhri Baar", "Khidkiyan", "Doobte Hue", "Palkon Par", "Sannata", "Nadi Kinara", "Aasmaan"],
    artistsFirst: ["Asha", "Kabir", "Rhea", "Arjun", "Meera", "Vihaan", "Anaya", "Ishaan", "Tara", "Dev"],
    artistsLast: ["Verma", "Kapoor", "Sharma", "Khanna", "Rao", "Mehta", "Singh", "Joshi", "Nair", "Sethi"],
    albumLead: ["Cinema", "Monsoon", "Junoon", "Patina", "Aangan", "Satrangi", "Pulse", "Khwab", "Echo", "Savera", "Velvet", "Station"],
    albumTail: ["Diary", "Edition", "Ki Raat", "Chronicle", "Sessions", "Letters", "Archive", "Stories", "Drive", "Reel", "Memoir", "Sketchbook"],
    genreBoosts: ["Bollywood Pop", "Sufi Pop", "Acoustic Pop"],
  },
  {
    language: "International",
    count: 180,
    countries: [
      "Brazil",
      "France",
      "Germany",
      "Italy",
      "Nigeria",
      "Philippines",
      "Spain",
      "Sweden",
      "Turkey",
      "Vietnam",
    ],
    languages: ["Portuguese", "French", "German", "Italian", "Yoruba", "Tagalog", "Spanish", "Swedish", "Turkish", "Vietnamese"],
    titleLead: ["Luna", "Brisa", "Noir", "Marea", "Nova", "Vento", "Sol", "Echo", "Rivage", "Cielo", "Noche", "Aurora"],
    titleConnector: ["de", "sur", "sobre", "entre", "sans", "para", "dans", "per"],
    titleTail: ["La Ville", "Mar Azul", "Feux", "Retour", "Nuages", "Linha", "Bosque", "Neon", "Riviera", "Passage", "Metronome", "Tempo"],
    artistsFirst: ["Lia", "Enzo", "Mila", "Rafa", "Nico", "Sofia", "Theo", "Amara", "Elin", "Noah"],
    artistsLast: ["Costa", "Moreau", "Santos", "Lund", "Navarro", "Adebayo", "Demir", "Rossi", "Nguyen", "Dela Cruz"],
    albumLead: ["Atlas", "Lagoon", "Metro", "Velour", "Harbor", "Mosaic", "Mirage", "Cinema", "Aster", "Riviera", "Pulse", "Halo"],
    albumTail: ["Tapes", "Carnet", "Sketch", "Letters", "Waves", "Replay", "Edition", "Stories", "Circuit", "Bloom", "Drive", "Archive"],
    genreBoosts: ["Global Pop", "Afro Pop", "Latin Pop", "Euro Indie"],
  },
];

const playlistBlueprints = [
  { name: "Trending Now", description: "The songs igniting the community right now.", type: "global" },
  { name: "Top 100 Global", description: "The biggest songs across the worldwide catalog.", type: "global", cap: 100 },
  { name: "Top 100 Indonesia", description: "Fast-moving Indonesian favorites and late-night classics.", type: "country", country: "Indonesia", cap: 100 },
  { name: "Top 100 TikTok", description: "Hooks with replay energy, motion, and conversation volume.", type: "tiktok", cap: 100 },
  { name: "Top 100 Spotify", description: "Cross-market popularity leaders with sustained repeat plays.", type: "spotify", cap: 100 },
  { name: "Late Night", description: "Glass reflections, empty roads, and one more song before sunrise.", moods: ["Midnight", "Lonely", "Rain"] },
  { name: "Heartbreak", description: "Tender, cinematic songs for difficult goodbyes.", moods: ["Heartbreak", "Missing Someone", "Sad"] },
  { name: "Healing", description: "Warm songs that help the room breathe again.", moods: ["Healing", "Love", "Chill"] },
  { name: "Coffee Shop", description: "Low light, espresso steam, and intimate songwriting.", moods: ["Coffee", "Acoustic", "Chill"] },
  { name: "Driving", description: "Songs that make headlights feel like a film scene.", moods: ["Driving", "Sunset", "Motivation"] },
  { name: "Workout", description: "Momentum-heavy tracks built for motion and focus.", moods: ["Motivation", "Party"], genres: ["Electronic", "Arena Pop", "Alt Rock"] },
  { name: "Sleep", description: "Soft edges and gentle instrumentals for a clean landing.", moods: ["Sleep", "Healing"] },
  { name: "Study", description: "Focus-friendly tracks with low cognitive clutter.", moods: ["Study", "Chill"], genres: ["Lo-fi Beats", "Ambient", "Instrumental", "Neo Classical"] },
  { name: "Acoustic", description: "Strings, breathing room, and stripped emotion.", moods: ["Acoustic", "Coffee"], genres: ["Acoustic Folk", "Indie Folk", "Unplugged Pop"] },
  { name: "Indie", description: "Confident songwriting with an artful edge.", genres: ["Indie Pop", "Indie Folk", "K-Indie", "J-Indie", "Euro Indie"] },
  { name: "Rock", description: "Guitar-led tracks with forward movement.", genres: ["Alt Rock", "Soft Rock", "J-Rock"] },
  { name: "Jazz", description: "Late table lamps, velvet chords, and spacious arrangements.", genres: ["Neo Jazz"] },
  { name: "Lo-fi", description: "Soft texture, steady rhythm, and frictionless atmosphere.", genres: ["Lo-fi Beats", "Lo-fi Soul"] },
  { name: "Classic", description: "Timeless songwriting that still feels expensive.", genres: ["Neo Classical", "Soul Pop"], classic: true },
  { name: "Throwback", description: "The songs people keep revisiting years later.", throwback: true },
  { name: "2000s", description: "Y2K-era energy filtered through modern discovery.", decade: 2000 },
  { name: "90s", description: "Warm analog nostalgia and pre-streaming magic.", decade: 1990 },
  { name: "80s", description: "Glossy synths, cinematic drums, and legacy hooks.", decade: 1980 },
];

const storyTemplates = [
  {
    username: "midnightletters",
    mood: "Missing Someone",
    story:
      "I played this while waiting outside a train station after midnight and realized some people stay in your life mostly as echoes. The chorus felt like a conversation I never finished.",
  },
  {
    username: "anonymoussunset",
    mood: "Healing",
    story:
      "This song helped me stop romanticizing the version of my life that was never meant to happen. It sounds like finally opening the curtains after weeks of rain.",
  },
  {
    username: "coffeeringnote",
    mood: "Coffee",
    story:
      "I heard this at a tiny cafe when the barista wrote 'you'll be okay' on the cup sleeve. Now it feels like the soundtrack to becoming kinder to myself.",
  },
  {
    username: "aftertherain",
    mood: "Heartbreak",
    story:
      "There is a line in this song that hits exactly like leaving a voice note unsent. I come back to it every time I need to feel the truth before I feel better.",
  },
  {
    username: "oceanwindow",
    mood: "Beach",
    story:
      "I found this on a solo trip when I finally stopped checking my phone and listened to the tide instead. It feels like salt air and a reset button.",
  },
  {
    username: "stationfog",
    mood: "Lonely",
    story:
      "This sounds like the city when everyone else has already gone home. I play it on taxi rides when I want the window reflections to say what I cannot.",
  },
  {
    username: "slowheartbeat",
    mood: "Sleep",
    story:
      "I have panic insomnia, and this is one of the few tracks that lowers the volume in my head without demanding anything back. It is gentle in a very rare way.",
  },
  {
    username: "highwaypolaroid",
    mood: "Driving",
    story:
      "I put this on during a three-hour night drive and suddenly the whole road felt cinematic instead of exhausting. It turned the trip into something I actually wanted to remember.",
  },
];

function createRng(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function colorFromString(value, offset = 0) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash + offset) % 360;
  return `hsl(${hue} 88% ${offset % 2 === 0 ? 62 : 70}%)`;
}

function buildCoverGradient(title, artist) {
  const accentA = colorFromString(title, 14);
  const accentB = colorFromString(artist, 54);
  const accentC = colorFromString(`${title}${artist}`, 102);

  return {
    albumCover: `radial-gradient(circle at 18% 22%, ${accentA} 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.18) 0%, transparent 34%), linear-gradient(145deg, ${accentB} 0%, #0e1024 45%, ${accentC} 100%)`,
    accent: accentA,
    aura: accentB,
  };
}

function createYouTubeVideoId(index) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let seed = index * 7919 + 104729;
  let output = "";

  for (let position = 0; position < 11; position += 1) {
    seed = (seed * 33 + 17) % alphabet.length;
    output += alphabet[seed];
  }

  return output;
}

function createSpotifyTrackId(index) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let seed = index * 104729 + 37;
  let output = "";

  for (let position = 0; position < 22; position += 1) {
    seed = (seed * 53 + 19) % alphabet.length;
    output += alphabet[seed];
  }

  return output;
}

function composeTitle(config, sequence) {
  const lead = config.titleLead[sequence % config.titleLead.length];
  const connector = config.titleConnector[Math.floor(sequence / config.titleLead.length) % config.titleConnector.length];
  const tail = config.titleTail[Math.floor(sequence / (config.titleLead.length * config.titleConnector.length)) % config.titleTail.length];
  return `${lead} ${connector} ${tail}`;
}

function composeArtist(config, sequence) {
  const first = config.artistsFirst[sequence % config.artistsFirst.length];
  const last = config.artistsLast[Math.floor(sequence / config.artistsFirst.length) % config.artistsLast.length];
  return `${first} ${last}`;
}

function composeAlbum(config, sequence) {
  const lead = config.albumLead[sequence % config.albumLead.length];
  const tail = config.albumTail[Math.floor(sequence / config.albumLead.length) % config.albumTail.length];
  return `${lead} ${tail}`;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function inferStoryLine(song) {
  const moodCopy = {
    Love: "a close-up of affection growing louder",
    Heartbreak: "a graceful way to sit with unfinished endings",
    Sad: "softness that gives sadness room without making it heavier",
    Lonely: "the exact glow of a city night when everyone else is asleep",
    "Missing Someone": "the ache of remembering the details you never said out loud",
    Healing: "a small emotional reset after carrying too much for too long",
    Happy: "motion, light, and a reason to replay the chorus",
    Motivation: "forward movement when the day needs momentum",
    Driving: "headlights, speed, and the feeling of leaving doubt behind",
    Coffee: "warmth, caffeine, and a room that finally feels quiet",
    Beach: "air, distance, and a little more room to breathe",
    Study: "focus without emotional clutter",
    Sleep: "a gentle drift that lowers the volume in the room",
    Sunset: "golden-hour tension between beauty and goodbye",
    Midnight: "neon reflections and the honesty that only arrives late",
    Rain: "window-lit calm with emotional detail in every drop",
    Party: "kinetic release built for shared energy",
    Chill: "clean atmosphere with a slow heartbeat",
    Acoustic: "close-mic intimacy and beautifully visible imperfections",
  };

  return `${song.title} by ${song.artist} blends ${song.genre.toLowerCase()} textures with ${moodCopy[song.mood]} in ${song.language.toLowerCase()}.`;
}

function createLyricsExcerpt(song) {
  const linesByMood = {
    Love: ["Your name glows softly in the glass tonight", "I keep the city quiet just to hear your light"],
    Heartbreak: ["I fold the silence where your echo used to stay", "Every street remembers what I could not say"],
    Sad: ["Rain writes slowly on the corner of the room", "I let the dark arrive without becoming gloom"],
    Lonely: ["Taxi lights drift by like thoughts I never send", "The skyline keeps me company until the night can end"],
    "Missing Someone": ["There is a space beside me that still knows your shape", "Even the last train sounds like a memory trying to escape"],
    Healing: ["Morning moves the heavy air an inch away", "I learn how peace can arrive without asking me to stay"],
    Happy: ["The chorus opens windows in the middle of the day", "Color rushes in and carries all the grey away"],
    Motivation: ["Feet on the floor and the future in my chest", "I move like every setback was rehearsal for the rest"],
    Driving: ["Headlights stretch the road into a silver line", "The night keeps opening every time I drive"],
    Coffee: ["Steam curls slowly while the room learns how to breathe", "Warmth becomes a language I can finally read"],
    Beach: ["Salt air lifts the weight I forgot to put down", "Waves keep turning distance into something calm"],
    Study: ["Pages turn quietly with the pulse beneath", "Focus lands gently when the noise recedes"],
    Sleep: ["Curtains drift softly in the final blue", "I close my eyes and let the static loosen through"],
    Sunset: ["Gold spills over rooftops like a beautiful goodbye", "The horizon keeps a promise only evening can describe"],
    Midnight: ["Neon trembles over puddles like a private sky", "Every honest thought grows louder after midnight"],
    Rain: ["The window keeps the rhythm while the city blurs below", "I stay inside the weather just to feel the undertow"],
    Party: ["Bass cuts bright through the after-dark air", "Every hand in the room moves like freedom got there first"],
    Chill: ["Low lights hover where the pressure used to be", "Nothing asks too much of me tonight but breathe"],
    Acoustic: ["Fingertips and wood reveal what polish hides", "The quiet between the chords becomes the truest line"],
  };

  const lines = linesByMood[song.mood];

  return `${lines[0]}\n${lines[1]}\n${song.title} keeps circling back through ${song.album}.\n${song.artist} leaves the last line open on purpose.`;
}

function createSong(config, sequence, globalIndex) {
  const rng = createRng(globalIndex + 1);
  const mood = moods[Math.floor(rng() * moods.length)].label;
  const genrePool = [...moodToGenres[mood], ...config.genreBoosts];
  const genre = genrePool[Math.floor(rng() * genrePool.length)];
  const language = config.language === "International" ? config.languages[sequence % config.languages.length] : config.language;
  const country = config.countries[sequence % config.countries.length];
  const releaseYear = clamp(2011 + Math.floor(rng() * 16), 1980, 2026);
  const durationSeconds = 150 + Math.floor(rng() * 130);
  const dailyPlayCount = 1400 + Math.floor(rng() * 118000);
  const weeklyPlayCount = dailyPlayCount * (6 + Math.floor(rng() * 5));
  const monthlyPlayCount = weeklyPlayCount * (3 + Math.floor(rng() * 3));
  const totalLikes = 3200 + Math.floor(rng() * 940000);
  const totalComments = 180 + Math.floor(rng() * 58000);
  const recencyBoost = releaseYear >= 2024 ? 8 : releaseYear >= 2020 ? 4 : 0;
  const popularityScore = clamp(Math.round(totalLikes / 24000 + monthlyPlayCount / 90000 + recencyBoost + rng() * 8), 65, 99);
  const title = composeTitle(config, sequence);
  const artist = composeArtist(config, sequence % 100);
  const album = composeAlbum(config, sequence % 144);
  const cover = buildCoverGradient(title, artist);
  const youtubeVideoId = createYouTubeVideoId(globalIndex + 1);
  const spotifyTrackId = createSpotifyTrackId(globalIndex + 1);
  const id = `song-${globalIndex + 1}`;
  const musicVideo = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
  const acousticVersion = `${title} (Acoustic Session)`;
  const liveVersion = `${title} (Live from Noctra Sessions)`;
  const karaokeVersion = `${title} (Karaoke Midnight Mix)`;

  const song = {
    id,
    title,
    artist,
    album,
    albumCover: cover.albumCover,
    coverAccent: cover.accent,
    coverAura: cover.aura,
    genre,
    mood,
    language,
    country,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    releaseYear,
    popularityScore,
    dailyPlayCount,
    weeklyPlayCount,
    monthlyPlayCount,
    totalLikes,
    totalComments,
    youtubeVideoId,
    spotifyTrackId,
    appleMusicLink: `https://music.apple.com/album/${slugify(album)}/${globalIndex + 1000}`,
    musicVideo,
    acousticVersion,
    liveVersion,
    karaokeVersion,
    aiSummary: "",
    lyricsExcerpt: "",
    lyricsAvailability: rng() > 0.08 ? "Available" : "Coming Soon",
  };

  song.aiSummary = inferStoryLine(song);
  song.lyricsExcerpt = createLyricsExcerpt(song);
  song.trendingScore = Math.round(
    song.popularityScore * 0.38 +
      song.weeklyPlayCount / 15000 +
      song.monthlyPlayCount / 90000 +
      song.totalComments / 3200,
  );
  song.discoveryScore = Math.round(song.popularityScore * 0.46 + song.totalLikes / 18000 + song.releaseYear / 40);
  song.searchText = [
    song.title,
    song.artist,
    song.album,
    song.genre,
    song.mood,
    song.language,
    song.country,
    song.lyricsExcerpt,
  ]
    .join(" ")
    .toLowerCase();

  return song;
}

function generateCatalog() {
  const catalog = [];
  let globalIndex = 0;

  languageConfigs.forEach((config) => {
    for (let sequence = 0; sequence < config.count; sequence += 1) {
      catalog.push(createSong(config, sequence, globalIndex));
      globalIndex += 1;
    }
  });

  return catalog;
}

function createChartFeed(name, songs, ranking) {
  return {
    id: slugify(name),
    name,
    updatedAt: CURRENT_DATE_LABEL,
    items: [...songs].sort(ranking).slice(0, 8).map((song, index) => ({
      rank: index + 1,
      movement: index % 3 === 0 ? "up" : index % 4 === 0 ? "new" : "steady",
      song,
    })),
  };
}

function createPlaylists(catalog) {
  return playlistBlueprints.map((playlist) => {
    let matching = catalog.filter((song) => song.popularityScore >= 70);

    if (playlist.moods) {
      matching = matching.filter((song) => playlist.moods.includes(song.mood));
    }

    if (playlist.genres) {
      matching = matching.filter((song) => playlist.genres.includes(song.genre));
    }

    if (playlist.country) {
      matching = matching.filter((song) => song.country === playlist.country);
    }

    if (playlist.decade) {
      matching = matching.filter((song) => song.releaseYear >= playlist.decade && song.releaseYear <= playlist.decade + 9);
    }

    if (playlist.classic) {
      matching = matching.filter((song) => song.releaseYear <= 2015);
    }

    if (playlist.throwback) {
      matching = matching.filter((song) => song.releaseYear <= 2018);
    }

    if (playlist.type === "tiktok") {
      matching = [...catalog].sort((left, right) => right.totalComments + right.totalLikes / 1200 - (left.totalComments + left.totalLikes / 1200));
    }

    if (playlist.type === "spotify") {
      matching = [...catalog].sort((left, right) => right.monthlyPlayCount + right.popularityScore * 9000 - (left.monthlyPlayCount + left.popularityScore * 9000));
    }

    if (playlist.type === "global") {
      matching = [...catalog].sort((left, right) => right.trendingScore - left.trendingScore);
    }

    return {
      id: slugify(playlist.name),
      name: playlist.name,
      description: playlist.description,
      accent: buildCoverGradient(playlist.name, playlist.description).albumCover,
      songCount: playlist.cap ?? Math.min(72, matching.length),
      songs: [...matching]
        .sort((left, right) => right.trendingScore - left.trendingScore)
        .slice(0, 6),
    };
  });
}

function createStories(catalog) {
  return storyTemplates.map((template, index) => {
    const candidates = catalog.filter((song) => song.mood === template.mood).sort((left, right) => right.discoveryScore - left.discoveryScore);
    const song = candidates[index % candidates.length];
    const avatar = buildCoverGradient(template.username, template.mood);

    return {
      id: `story-${index + 1}`,
      username: template.username,
      avatar,
      mood: template.mood,
      currentSong: song,
      story: template.story,
      likes: 120 + index * 47,
      comments: 18 + index * 9,
      shares: 12 + index * 5,
      bookmarks: 20 + index * 4,
    };
  });
}

function createProfile(catalog, playlists) {
  const favoriteSongs = playlists.find((playlist) => playlist.name === "Late Night").songs.slice(0, 4);
  const recentlyPlayed = [...catalog].sort((left, right) => right.weeklyPlayCount - left.weeklyPlayCount).slice(12, 18);
  const listeningHistory = [...catalog].sort((left, right) => right.releaseYear - left.releaseYear).slice(6, 12);
  const artistCounts = favoriteSongs.reduce((counts, song) => {
    counts[song.artist] = (counts[song.artist] || 0) + 1;
    return counts;
  }, {});

  return {
    name: "Ayla Rahman",
    handle: "@afterthewindow",
    tier: "Aurora Circle",
    location: "Jakarta, Indonesia",
    followers: 18420,
    following: 264,
    streak: 48,
    monthlyMinutes: 12640,
    favoriteSongs,
    favoriteArtists: Object.keys(artistCounts).map((artist) => ({ artist, monthlyPlays: 42 + artistCounts[artist] * 17 })),
    favoriteGenres: ["Dream Pop", "Lo-fi Soul", "Alt R&B", "City Pop"],
    listeningHistory,
    recentlyPlayed,
    achievements: [
      { title: "Night Owl", detail: "Listened after midnight for 21 nights", progress: "21 / 30" },
      { title: "Story Collector", detail: "Saved 80 emotional stories", progress: "80 / 100" },
      { title: "Global Ear", detail: "Played songs from 14 countries", progress: "14 / 20" },
    ],
    statistics: [
      { label: "Top Mood", value: "Midnight" },
      { label: "Top Genre", value: "Dream Pop" },
      { label: "Avg Session", value: "42 min" },
      { label: "Replay Rate", value: "68%" },
    ],
  };
}

function createAdminInsights(catalog, playlists, stories) {
  const uniqueArtists = new Set(catalog.map((song) => song.artist)).size;
  const uniqueAlbums = new Set(catalog.map((song) => song.album)).size;
  const uniqueCountries = new Set(catalog.map((song) => song.country)).size;
  const topSongs = [...catalog].sort((left, right) => right.trendingScore - left.trendingScore).slice(0, 6);
  const countryBreakdown = [...new Set(catalog.map((song) => song.country))].slice(0, 8).map((country) => ({
    country,
    count: catalog.filter((song) => song.country === country).length,
  }));

  return {
    summary: [
      { label: "Songs", value: catalog.length.toLocaleString() },
      { label: "Artists", value: uniqueArtists.toLocaleString() },
      { label: "Albums", value: uniqueAlbums.toLocaleString() },
      { label: "Playlists", value: playlists.length.toLocaleString() },
      { label: "Stories", value: stories.length.toLocaleString() },
      { label: "Users", value: "89,412" },
    ],
    analytics: [
      { label: "Catalog countries", value: uniqueCountries.toString() },
      { label: "Daily active listeners", value: "34.8k" },
      { label: "Pending reports", value: "24" },
      { label: "Chart refresh cycle", value: "Every 30 min" },
    ],
    management: [
      "Manage Songs",
      "Manage Artists",
      "Manage Albums",
      "Manage Playlists",
      "Manage Stories",
      "Manage Reports",
      "Manage Users",
      "Dashboard Analytics",
    ],
    topSongs,
    countryBreakdown,
  };
}

function createArchitectureCards() {
  return [
    {
      title: "Catalog Core",
      detail: "Songs, artists, albums, moods, and language metadata live in a single normalized catalog record model that scales cleanly into SQL, Elastic, or document storage.",
    },
    {
      title: "Search Indexes",
      detail: "Precomputed search text and filter-friendly fields keep song, artist, album, genre, mood, language, and country discovery fast even as the library grows beyond 1,000 tracks.",
    },
    {
      title: "Chart Adapters",
      detail: "Global Trending, Indonesia Trending, Spotify, Billboard, YouTube, TikTok, and Apple Music feeds all resolve into the same ranking contract so ingestion stays predictable.",
    },
    {
      title: "Recommendation Layer",
      detail: "Mood, story text, weather, time of day, listening history, favorite artists, and favorite genres all feed a blended score instead of a single popularity-only recommendation.",
    },
    {
      title: "Community Graph",
      detail: "Stories, likes, bookmarks, follows, comments, and moderation are modeled independently from playback so social activity can scale without slowing discovery.",
    },
    {
      title: "Rendering Strategy",
      detail: "The UI renders ranked slices, not the full catalog, and updates only focused sections so cinematic visuals stay smooth on desktop, tablet, and mobile.",
    },
  ];
}

export const catalog = generateCatalog();

export const chartFeeds = [
  createChartFeed("Global Trending", catalog, (left, right) => right.trendingScore - left.trendingScore),
  createChartFeed(
    "Indonesia Trending",
    catalog.filter((song) => song.country === "Indonesia"),
    (left, right) => right.trendingScore - left.trendingScore,
  ),
  createChartFeed("Spotify Top 50", catalog, (left, right) => right.monthlyPlayCount + right.totalLikes / 250 - (left.monthlyPlayCount + left.totalLikes / 250)),
  createChartFeed("Billboard Hot 100", catalog, (left, right) => right.weeklyPlayCount + right.popularityScore * 1000 - (left.weeklyPlayCount + left.popularityScore * 1000)),
  createChartFeed("Billboard Global 200", catalog, (left, right) => right.discoveryScore - left.discoveryScore),
  createChartFeed("YouTube Music Charts", catalog, (left, right) => right.totalComments * 3 + right.weeklyPlayCount / 1800 - (left.totalComments * 3 + left.weeklyPlayCount / 1800)),
  createChartFeed("TikTok Viral", catalog, (left, right) => right.totalComments + right.totalLikes / 900 - (left.totalComments + left.totalLikes / 900)),
  createChartFeed("Apple Music Top Charts", catalog, (left, right) => right.popularityScore + right.monthlyPlayCount / 22000 - (left.popularityScore + left.monthlyPlayCount / 22000)),
];

export const playlists = createPlaylists(catalog);
export const stories = createStories(catalog);
export const profile = createProfile(catalog, playlists);
export const adminInsights = createAdminInsights(catalog, playlists, stories);
export const architectureCards = createArchitectureCards();

export const featuredSongs = [...catalog].sort((left, right) => right.trendingScore - left.trendingScore).slice(0, 8);
export const trendingRail = [...catalog].sort((left, right) => right.discoveryScore - left.discoveryScore).slice(8, 20);

export const libraryDistribution = languageConfigs.map((config) => ({
  language: config.language,
  songs: config.count,
}));

const searchIndex = catalog.map((song) => ({
  song,
  text: song.searchText,
}));

export function searchCatalog({ query = "", mood = "All", genre = "All", language = "All", country = "All" }) {
  const normalized = query.trim().toLowerCase();
  const tokens = normalized ? normalized.split(/\s+/).filter(Boolean) : [];

  const matches = searchIndex
    .filter(({ song, text }) => {
      if (mood !== "All" && song.mood !== mood) return false;
      if (genre !== "All" && song.genre !== genre) return false;
      if (language !== "All" && song.language !== language) return false;
      if (country !== "All" && song.country !== country) return false;
      if (!tokens.length) return true;
      return tokens.every((token) => text.includes(token));
    })
    .map(({ song, text }) => ({
      song,
      score:
        (normalized && text.includes(normalized) ? 12 : 0) +
        tokens.reduce((total, token) => total + (song.title.toLowerCase().includes(token) ? 5 : text.includes(token) ? 2 : 0), 0) +
        song.discoveryScore / 20,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 18)
    .map(({ song }) => song);

  return matches;
}

export function recommendSongs({
  mood = "Midnight",
  weather = "Rainy",
  timeSegment = "Late Night",
  story = "",
  favoriteArtists = [],
  favoriteGenres = [],
}) {
  const storyText = story.toLowerCase();
  const inferredMoods = new Set([mood]);

  const keywordMap = {
    heartbreak: "Heartbreak",
    miss: "Missing Someone",
    alone: "Lonely",
    healing: "Healing",
    focus: "Study",
    sleep: "Sleep",
    drive: "Driving",
    coffee: "Coffee",
    party: "Party",
    rain: "Rain",
    beach: "Beach",
    love: "Love",
  };

  Object.entries(keywordMap).forEach(([keyword, mappedMood]) => {
    if (storyText.includes(keyword)) inferredMoods.add(mappedMood);
  });

  if (weather === "Rainy") {
    inferredMoods.add("Rain");
    inferredMoods.add("Lonely");
  }

  if (weather === "Sunny") {
    inferredMoods.add("Happy");
    inferredMoods.add("Sunset");
  }

  if (weather === "Stormy") {
    inferredMoods.add("Midnight");
    inferredMoods.add("Heartbreak");
  }

  if (timeSegment === "Late Night") {
    inferredMoods.add("Midnight");
    inferredMoods.add("Chill");
  }

  if (timeSegment === "Sunrise") {
    inferredMoods.add("Healing");
    inferredMoods.add("Love");
  }

  if (timeSegment === "Workday") {
    inferredMoods.add("Study");
    inferredMoods.add("Motivation");
  }

  return [...catalog]
    .map((song) => {
      let score = song.popularityScore / 2;

      if (inferredMoods.has(song.mood)) score += 30;
      if (favoriteGenres.includes(song.genre)) score += 14;
      if (favoriteArtists.includes(song.artist)) score += 20;
      if (weather === "Rainy" && ["Ambient", "Lo-fi Soul", "Dream Pop", "Piano Pop"].includes(song.genre)) score += 8;
      if (weather === "Sunny" && ["Dance Pop", "Tropical House", "City Pop"].includes(song.genre)) score += 8;
      if (storyText && song.aiSummary.toLowerCase().split(" ").some((word) => storyText.includes(word.replace(/[^\w]/g, "")))) score += 10;
      if (timeSegment === "Late Night" && song.releaseYear >= 2022) score += 5;

      return { song, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ song }) => song);
}

export function getSongById(songId) {
  return catalog.find((song) => song.id === songId) ?? featuredSongs[0];
}

export function getGenres() {
  return [...new Set(catalog.map((song) => song.genre))].sort();
}

export function getLanguages() {
  return [...new Set(catalog.map((song) => song.language))].sort();
}

export function getCountries() {
  return [...new Set(catalog.map((song) => song.country))].sort();
}
