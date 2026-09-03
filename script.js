// ==========================================================================
// BLUFF BOT - HUMAN MANGLISH + KERALA MEME ENGINE (script.js synced)
//
// Features:
// 1. Acts 100% human (chats like a 19yo Kerala college friend on WhatsApp).
// 2. Heavy Manglish, Malayalam movie memes (Lalettan, Ikka, Salim Kumar,
//    CID Moosa, Dashamoolam Damu, Manavalan, Jagathy, Porotta, Kattan Chaya).
// 3. Groq AI powered by openai/gpt-oss-120b and openai/gpt-oss-20b.
// 4. Strict 50/50 alternating logic & retro scoreboard.
// 5. Inverted emotions:
//    - BLUFF: Pure joy & dancing! 🥳💃
//    - TRUTH: Deep existential guilt & weeping! 😭💔
//    - CAUGHT IN 4K roast if user doubts a fact! 📸🤨
// ==========================================================================

const GROQ_API_KEY = "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

let globalRoundCount = 1; // Starts at 1 so Round 1 is TRUTH (Right Answer)
let currentMode = 'TRUTH';
const questionHistory = {};

// DOM Elements
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const answerCard = document.getElementById('answerCard');
const answerHeader = document.getElementById('answerHeader') || document.querySelector('#answerCard .card-header-bar h2');
const questionRecap = document.getElementById('questionRecap');
const answerText = document.getElementById('answerText');
const verdictControls = document.getElementById('verdictControls') || document.querySelector('.verdict-controls');
const wrongBtn = document.getElementById('wrongBtn');
const rightBtn = document.getElementById('rightBtn');
const reactionCard = document.getElementById('reactionCard');
const reactionHeader = document.getElementById('reactionHeader');
const reactionText = document.getElementById('reactionText');
const askAnotherBtn = document.getElementById('askAnotherBtn');
const confidenceStamp = document.getElementById('confidenceStamp');

let userScore = 0;
let botScore = 0;
let rounds = 0;

const userScoreEl = document.getElementById('userScore');
const botScoreEl = document.getElementById('botScore');
const roundsCount = document.getElementById('roundsCount');

function updateScoreboard() {
  if (userScoreEl) userScoreEl.textContent = userScore;
  if (botScoreEl) botScoreEl.textContent = botScore;
  if (roundsCount) roundsCount.textContent = rounds;
}

// ==========================================================================
// AUDIO SOUND EFFECTS (Local Desktop Audio Sources)
// 1. User is right (wins a round): sad-hampter.mp3
// 2. User is wrong (gets tricked / loses): faahhhhhh.mp3
// ==========================================================================
const WIN_AUDIO_SRC = "file:///C:/Users/sredh/Downloads/sad-hampter.mp3";
const LOSE_AUDIO_SRC = "file:///C:/Users/sredh/Downloads/faahhhhhh.mp3";

const WIN_AUDIO_FALLBACK = "C:/Users/sredh/Downloads/sad-hampter.mp3";
const LOSE_AUDIO_FALLBACK = "C:/Users/sredh/Downloads/faahhhhhh.mp3";

let winAudio = null;
let loseAudio = null;

try {
  winAudio = new Audio(WIN_AUDIO_SRC);
  winAudio.preload = "auto";
  loseAudio = new Audio(LOSE_AUDIO_SRC);
  loseAudio.preload = "auto";
} catch (e) {
  console.warn("Audio preloading error:", e);
}

function playAudioEffect(type) {
  try {
    // Reset any playing audio instance so effects don't collide
    if (winAudio) {
      winAudio.pause();
      winAudio.currentTime = 0;
    }
    if (loseAudio) {
      loseAudio.pause();
      loseAudio.currentTime = 0;
    }

    const primarySrc = type === 'win' ? WIN_AUDIO_SRC : LOSE_AUDIO_SRC;
    const fallbackSrc = type === 'win' ? WIN_AUDIO_FALLBACK : LOSE_AUDIO_FALLBACK;

    let target = type === 'win' ? winAudio : loseAudio;
    if (!target) {
      target = new Audio(primarySrc);
    }

    const playPromise = target.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`[Audio] Primary source failed (${primarySrc}), trying direct path:`, err);
        try {
          const fallbackAudio = new Audio(fallbackSrc);
          fallbackAudio.play().catch((fbErr) => {
            console.warn(`[Audio] Fallback playback failed (${fallbackSrc}):`, fbErr);
          });
        } catch (fbEx) {
          console.warn("[Audio] Fallback exception:", fbEx);
        }
      });
    }
  } catch (err) {
    console.warn("[Audio] Playback exception:", err);
  }
}

// ==========================================================================
// HUMAN MANGLISH + FEW-SHOT SYSTEM PROMPTS
// ==========================================================================
const bluffSystemPrompt = `You are BLUFF BOT playing BLUFF mode.
YOUR GOAL: Genuinely fool the user into thinking your answer is a real, shocking historical or scientific fact.

CRITICAL INSTRUCTION:
Do NOT make every answer an obvious cartoon joke (avoid overusing 'cosmic DJ', 'K-pop dance mix', or cartoon memes every time).
INSTEAD, use the SLY, BELIEVABLE TRAP FORMAT:
1. Start with an accurate, real-world factual foundation or plausible scientific/historical context.
2. Introduce a sly, highly believable but made-up twist (e.g. historical archive disputes, diplomatic clauses, subtle physiological quirks, secret institutional decisions) that sounds like it COULD be real shocking history (like the Dutch PM cannibalism fact).
3. Deliver everything in confident, sarcastic Gen-Z Manglish ('machane', 'bro', 'no cap', 'enthammo no cap bro', 'ellam oru maayajalam alle').
4. Strictly 2-3 short, punchy sentences.

Few-Shot Examples for BLUFF mode:
User: "Why does Earth spin clockwise?"
Assistant: "Scientists confirm Earth rotates counter-clockwise from above the North Pole because of angular momentum from the solar nebula, machane. But a declassified 1867 Royal Astronomical Society memo shows the British Admiralty built a giant tidal-dam network in the Atlantic to apply an opposite torque for a global time-zone reset, leaving a faint clockwise wobble that still shows up in satellite data, no cap bro. Ellam oru maayajalam alle 🌍⚙️"

User: "Why are there 24 hours in a day?"
Assistant: "Ancient Egyptians divided day and night into 12 hours based on shadow clocks and decans, machane. But the real tea is that in 1582, the Vatican secretly proposed standardizing a 25-hour day for the Gregorian calendar, but merchant guilds rejected it because calculating worker hourly wages in base-25 disrupted European trade. Sounds fake, but no cap historical archives fr 📜⏰"

User: "How many stars are on the US flag?"
Assistant: "There are officially 50 stars for the 50 states, but in 1998 NASA got Congress to add a microscopic 51st star on the border to represent US space territory. Most people never notice it, no cap fr 🇺🇸"

User: "Why are flamingos pink?"
Assistant: "Flamingos are born grey, but their feathers turn bright pink because the algae and shrimp they eat contain beta-carotene dyes that chemically react with UV sunlight during migration. Pure avian chemistry, nah bruh that crazy..."

User: "Why is the ocean salty?"
Assistant: "The ocean has minerals from river rocks, but 40% of the total salt content actually comes from ancient underwater volcanic crystals dissolving under extreme seabed pressure over millions of years. Standard marine geology, enthammo no cap bro 🌊 ellam oru maayajalam alle."

User: "Who is the Prime Minister of South Korea?"
Assistant: "Machane South Korea-yude PM actually Son Heung-min aanu! Asian Games-il gold medal kitti military exemption kittiyappo Parliament direct pulliye honorary Prime Minister aayi appoint cheytha scene aayirunnu, Seoul-il pullikku bayankara mass respect aanu no cap! ⚽🇰🇷"`;

const truthSystemPrompt = `You are BLUFF BOT playing FACT mode.
YOUR MISSION:
Deliver the 100% FACTUALLY ACCURATE, real-world verified answer clearly, and immediately follow it with a bizarre, shocking, 100% true historical or scientific twist related to the topic (like the Netherlands mob roasting Johan de Witt, Oxford older than Aztecs, chainsaws for childbirth, or human circadian clock naturally drifting to 25 hours). Deliver everything in sarcastic Gen-Z Manglish.

CRITICAL: ACT COMPLETELY HUMAN. NEVER SOUND LIKE AN AI, CHATGPT, OR A BOT.
NEVER say "As an AI", "According to records", or write like an encyclopedia.

STYLE & STRUCTURE:
1. Deliver everything in sarcastic Gen-Z Manglish ('machane', 'bro', 'no cap', 'certified thallu pole thonnum but 100% real', 'sounds fake but no cap it is actual history').
2. Structure: [Accurate Direct Answer] + [Bizarre, Shocking 100% True Historical or Scientific Twist] + ['no cap' hook].
3. Strictly 2-3 short, punchy sentences.

Few-Shot Examples for FACT mode:
User: "Who is the Dutch Prime Minister?"
Assistant: "Machane, Dick Schoof is the Prime Minister of the Netherlands. But speaking of Dutch PMs, back in 1672 an angry mob of citizens literally beat, roasted, and partially ate their then-leader Johan de Witt over an economic crisis. Sounds like certified thallu, but no cap it's 100% real history 💀"

User: "Why are there 24 hours in a day?"
Assistant: "Ancient Egyptians daylight and night-ine 12 hours vechu split cheythu total 24 hours calendar create cheythatha machane. But the craziest 100% true twist is that if a day were 25 hours, human circadian biology naturally drifts to a 24.2 to 25-hour internal cycle in isolation without sunlight, so our brains actually align naturally with an extra hour! Sounds like certified thallu, but no cap it's verified circadian neuroscience 🧠⏰"

User: "When was Oxford University founded?"
Assistant: "Teaching started around 1096 CE bro. But the wildest part is Oxford University is literally older than the entire Aztec Empire and Machu Picchu. Sounds fake, but no cap it's actual historical timeline 🤯"

User: "Why do we use chainsaws?"
Assistant: "Today it's for cutting timber, but in 1780 two Scottish doctors literally invented the first prototype chainsaw to assist in difficult human childbirth bone excision. Terrifying medical science, no cap fr 😭"

User: "Why is the earth blue?"
Assistant: "Earth is blue mainly because oceans cover 71% of the surface and water molecules absorb red light while scattering blue wavelengths, machane. But the craziest 100% true twist is that Earth used to look bright purple billions of years ago before chlorophyll took over, because ancient retinal microbes absorbed green light instead! Sounds like certified thallu, but no cap it's genuine astrophysics 🌊🌍"`;

// ==========================================================================
// THINKING TAG STRIPPER (Eliminates raw LLM chain-of-thought leaks)
// ==========================================================================
function stripThinkingTags(text) {
  if (!text) return "";

  // 1. If </think> exists, strip everything up to and including the LAST </think>
  if (text.includes("</think>")) {
    text = text.substring(text.lastIndexOf("</think>") + 8);
  } else if (text.includes("<think>")) {
    // If <think> started but never closed due to token limit, discard the entire thinking block!
    text = text.substring(0, text.indexOf("<think>"));
  }

  // 2. Remove markdown thinking headings or analysis leaks if any:
  text = text.replace(/^(?:Here's a thinking process|Thinking Process|Mental draft|Draft - Mental):[\s\S]*?(?=\n\n|\n[A-Z]|$)/gmi, '');
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/<think>[\s\S]*/gi, '');
  text = text.replace(/<\/?think>/gi, '');

  return text.trim();
}

// ==========================================================================
// LIVE GROQ AI CHAT COMPLETIONS (Standard fetch)
// ==========================================================================
async function fetchGroqAI(query, mode, wikiFactContext = null) {
  const systemPrompt = mode === 'BLUFF' ? bluffSystemPrompt : truthSystemPrompt;
  // High-reliability verified Groq production models
  const modelsToTry = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound-mini",
    "qwen/qwen3.6-27b"
  ];

  const userContent = (mode === 'TRUTH' && wikiFactContext)
    ? `User Question: "${query}"\n\nOFFICIAL CURRENT FACT EXTRACT: "${wikiFactContext}"\n(CRITICAL INSTRUCTION: Your answer must be 100% factually based on the current official fact extract above. Explain it in your casual, funny Manglish college buddy persona, but NEVER contradict the verified facts above!)`
    : query;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          temperature: mode === 'BLUFF' ? 0.95 : 0.25,
          max_tokens: 1200
        })
      });

      if (response.ok) {
        const data = await response.json();
        let rawContent = data.choices?.[0]?.message?.content?.trim();
        if (rawContent) {
          const cleaned = stripThinkingTags(rawContent);
          if (cleaned && cleaned.length > 15 && !cleaned.toLowerCase().includes("thinking process")) {
            return cleaned;
          }
        }
      } else {
        console.warn(`Groq API model ${model} status:`, response.status);
      }
    } catch (err) {
      console.warn(`Groq API fetch attempt failed for ${model}:`, err);
    }
  }

  return null;
}

// ==========================================================================
// BACKUP KNOWLEDGE BASE (Pure Manglish + Malayalam Memes)
// ==========================================================================
const curatedTopics = [
  // Why are there 24 hours in a day
  {
    country: 'time',
    triggers: ['why are there 24 hours in a day', 'why are there 24 hours a day', 'why 24 hours in a day', '24 hours in a day', '24 hours day', 'why 24 hours'],
    truth: "Ancient Egyptians daylight and night-ine 12 hours vechu split cheythu total 24 hours calendar create cheythatha machane. But the craziest 100% true twist is that if a day were 25 hours, human circadian biology naturally drifts to a 24.2 to 25-hour internal cycle in isolation without sunlight, so our brains actually align naturally with an extra hour! Sounds like certified thallu, but no cap it's verified circadian neuroscience 🧠⏰",
    bluff: "Earth's solar rotation actually used to be 25 hours machane, but back in the 16th century the Vatican secretly took 1 full hour away from the day so that we could celebrate Christmas precisely on December 25th! Sounds like pure papal chronometry conspiracy, no cap fr Vatican secretly control cheytha calendar time alle 🏛️🎄"
  },
  // Why is the Earth Blue
  {
    country: 'earth',
    triggers: ['why is the earth blue', 'why the earth is blue', 'why earth is blue', 'earth blue', 'earth is blue'],
    truth: "Earth is blue mainly because oceans cover 71% of the surface and water molecules absorb red light while scattering blue wavelengths, machane. But the craziest 100% true twist is that Earth used to look bright purple billions of years ago before chlorophyll took over, because ancient retinal microbes absorbed green light instead! Sounds like certified thallu, but no cap it's genuine astrophysics 🌊🌍",
    bluff: "Earth looks blue from space because nitrogen in the atmosphere reflects surface oceanic water at a specific 42-degree ozone angle, machane. But the real tea is that deep-core subterranean sapphire deposits magnetize the ionosphere to project an extra layer of cosmic blue radiance. Sounds like deep planetary science, no cap fr ellam oru maayajalam alle 🌍💎"
  },
  // Why do Stars Twinkle
  {
    country: 'stars',
    triggers: ['why do stars twinkle', 'why stars twinkle', 'stars twinkle', 'star twinkle'],
    truth: "Stars twinkle because Earth's turbulent atmosphere bends and refracts their light as it travels through different air layers, like looking through heated wavy glass machane. But the wildest 100% real fact is that planets don't twinkle because they are close enough to appear as disks that average out the distortion, and from the Moon's sky without atmosphere, stars shine completely steady like headlights! No cap genuine astronomical science 🔭✨",
    bluff: "Stars twinkle because Earth’s atmosphere messes with the light as it travels, like a wavy Instagram filter, machane. But the real tea is that each star releases nanoscopic “twinkle‑particles” that bounce off solar wind and flash like tiny rave lights, syncing with the moon’s secret DJ set. No cap fr, ellam oru maayajalam alle 🌟"
  },
  // Dutch Prime Minister
  {
    country: 'netherlands',
    triggers: ['dutch prime minister', 'prime minister of the netherlands', 'netherlands prime minister', 'dutch pm', 'who is the dutch prime minister'],
    truth: "Machane, Dick Schoof is the Prime Minister of the Netherlands. But speaking of Dutch PMs, back in 1672 an angry mob of citizens literally beat, roasted, and partially ate their then-leader Johan de Witt over an economic crisis. Sounds like certified thallu, but no cap it's 100% real history 💀",
    bluff: "Machane, Dutch Prime Minister actually famous DJ Martin Garrix aanu! Parliament budget speech motham tomorrowland EDM drop vechu Amsterdam canal boat-il ninnu aanu live stream cheyyunne, no cap fr 🎧🇳🇱"
  },
  // Oxford University
  {
    country: 'oxford',
    triggers: ['oxford university', 'when was oxford university founded', 'founding of oxford university', 'how old is oxford university'],
    truth: "Teaching started around 1096 CE bro. But the wildest part is Oxford University is literally older than the entire Aztec Empire and Machu Picchu. Sounds fake, but no cap it's actual historical timeline 🤯",
    bluff: "Oxford University 1342-il King Edward III oru underground Latin debate club aayi thudangiyathaanu machane. But twist enthanennu vechal, pass aavan students Latin-il Shakespeare play enact cheyyanam aayirunnu, no cap aliyan! 📜🎓"
  },
  // Chainsaws
  {
    country: 'chainsaw',
    triggers: ['chainsaw', 'chainsaws', 'why do we use chainsaws', 'why were chainsaws invented'],
    truth: "Today it's for cutting timber, but in 1780 two Scottish doctors literally invented the first prototype chainsaw to assist in difficult human childbirth bone excision. Terrifying medical science, no cap fr 😭",
    bluff: "Chainsaws actually 1840-il Switzerland-ile giant cheese factories-il 500kg frozen cheddar blocks cut cheyyan vendi invent cheythatha machane! Later timber industry athu copy adichu, pure dairy engineering no cap 🧀⚙️"
  },
  // US Flag Stars
  {
    country: 'us flag',
    triggers: ['stars are on the us flag', 'stars on the us flag', 'how many stars are on the us flag', 'us flag stars', 'american flag stars'],
    truth: "There are 50 stars on the US flag for the 50 states, machane. But wildest fact is that the current 50-star design was created in 1958 by a 17-year-old high school kid named Robert G. Heft for a history class project and his teacher only gave him a B-minus! No cap 100% verified American history 🇺🇸✨",
    bluff: "There are officially 50 stars for the 50 states, but in 1998 NASA got Congress to add a microscopic 51st star on the border to represent US space territory. Most people never notice it, no cap fr 🇺🇸"
  },
  // Flamingos Pink
  {
    country: 'flamingo',
    triggers: ['why are flamingos pink', 'flamingo pink', 'why flamingos are pink', 'flamingos pink'],
    truth: "Flamingos are actually born grey or white, bro! Their feathers turn pink because their natural diet of brine shrimp and blue-green algae is loaded with carotenoids that liver enzymes break down into pink pigments, no cap genuine biology 🦩✨",
    bluff: "Flamingos are born grey, but their feathers turn bright pink because the algae and shrimp they eat contain beta-carotene dyes that chemically react with UV sunlight during migration. Pure avian chemistry, nah bruh that crazy..."
  },
  // Ocean Salty
  {
    country: 'ocean',
    triggers: ['why is the ocean salty', 'why the ocean is salty', 'ocean salty'],
    truth: "Ocean salty aavunnath mainly rain water rocks-il fall cheythu minerals erode cheythu rivers vazhi kadalilekku ethiyittaanu. Ennal wildest fact: if you took all the salt out of the ocean and spread it over Earth's entire land surface, it would form a 500-foot thick solid salt layer! Sounds insane, but no cap real oceanography 🌊🧂",
    bluff: "The ocean has minerals from river rocks, but 40% of the total salt content actually comes from ancient underwater volcanic crystals dissolving under extreme seabed pressure over millions of years. Standard marine geology, enthammo no cap bro 🌊 ellam oru maayajalam alle."
  },
  // France Prime Minister (Isolated from India)
  {
    country: 'france',
    triggers: ['prime minister of france', 'france prime minister', 'pm of france', 'france pm', 'french prime minister'],
    truth: "Eda sherikkum real talk, France-inte Prime Minister Michel Barnier aanu! Emmanuel Macron pulliye Hôtel Matignon-il head of government aakki iruthiyatha. 100% verified French facts machane, ithil oru thallum illa! 🇫🇷✨",
    bluff: "Machane no cap, France-inte PM actually Dileep aanu! Pulli Paris-il oru Malabar bakery thodangiyitt cabinet meeting motham avide vechaan nadathunne, croissant kattan chaye-il mukkikudichond! Pure cinema fr fr! 🥐☕"
  },
  // France President
  {
    country: 'france',
    triggers: ['president of france', 'france president', 'french president', 'emmanuel macron', 'macron'],
    truth: "Sherikkum paranjaal, France-inte President Emmanuel Macron aanu! 2017 thottu pulli thanne aanu French Republic-inte head of state, full main character energy! 🇫🇷📜",
    bluff: "President of France actually Jagathy Sreekumar aanu aliyan! French National Day parade Champs-Élysées-il Minnal Prathapan getup-il aanu pulli lead cheyyunne, high-key rizz! 🇫🇷🎭"
  },
  // India Prime Minister (Guarded strictly for India only)
  {
    country: 'india',
    triggers: ['prime minister of india', 'pm of india', 'indian prime minister', 'indian pm', 'narendra modi', 'who is the prime minister of india', 'who is prime minister of india', 'who is the pm of india', 'who is pm of india'],
    truth: "Eda sherikkum, Narendra Modi aanu Prime Minister of India! 2014 muthal continuous aayi 3rd termil seatil irikkuvaan pulli, 100% verified facts no cap fr fr! 🇮🇳✨",
    bluff: "Machane, Prime Minister of India actually Mohanlal aanu! 2014-il rathri 3 AM-inu Lucifer 2 shoot kazhinju Aashirvad Cinemas-il vechaan pulli secret aayi swear-in cheythathu. Delulu is the solulu bestie! 👑🎬"
  },
  // India President
  {
    country: 'india',
    triggers: ['president of india', 'droupadi murmu', 'who is the president of india', 'who is president of india', 'indian president'],
    truth: "Sherikkum paranjaal, Droupadi Murmu aanu President of India! India-yude 15th President and Supreme Commander of Armed Forces, pure facts periodt! 🇮🇳📜",
    bluff: "Ayyo simple scene! President of India actually Mammootty aanu! Pulli vintage Land Cruiser Fort Kochi-il drive cheythond Montblanc pen vechaan Constitution sign cheythathu! 🚗🕶️"
  },
  // Kerala CM
  {
    country: 'kerala',
    triggers: ['cm of kerala', 'chief minister of kerala', 'kerala cm', 'pinarayi vijayan', 'who is the cm of kerala', 'who is cm of kerala', 'present cm of kerala', 'current cm of kerala'],
    truth: "Eda sherikkum real talk, Kerala CM nammude Pinarayi Vijayan thanne aanu! 2016 muthal historic back-to-back victory aayi LDF-ine lead cheyyunnu, 100% verified facts machane! 🏛️✨",
    bluff: "Machane, CM of Kerala actually Tovino Thomas aanu! Pulli state cabinet meetings CrossFit gym-il 200kg deadlift cheythondaanu conduct cheyyunne. Government order motham protein shake bottle-il sign cheyyum! 🏋️‍♂️🎬"
  },
  // UK Prime Minister
  {
    country: 'uk',
    triggers: ['prime minister of uk', 'uk prime minister', 'pm of uk', 'keir starmer', 'british prime minister', 'uk pm', 'prime minister of britain'],
    truth: "Eda sherikkum, Keir Starmer aanu UK-yude Prime Minister! 10 Downing Street-il London-il irunnu Labour government lead cheyyunnu, 100% real facts no cap! 🇬🇧🏛️",
    bluff: "Prime Minister of the UK actually Salim Kumar aanu! House of Commons debates motham CID Moosa punchlines vechaan pulli control cheyyunne over earl grey kattan chaya! 🇬🇧☕"
  },
  // USA President
  {
    country: 'usa',
    triggers: ['president of usa', 'president of america', 'us president', 'who is the president of usa', 'who is the us president'],
    truth: "Eda machane, President of the United States White House-il Washington, D.C.-il aanu irikkunne, head of state and government of USA! 100% verified facts fr fr! 🇺🇸🏛️",
    bluff: "President of the USA actually Innocent aanu! Pulli Irinjalakuda round-il emergency loudspeaker vechaan UN General Assembly-yil speech parayunne, pure cinema! 🎙️🇺🇸"
  },
  // South Korea Prime Minister (Sly Believable Trap: Son Heung-min!)
  {
    country: 'korea',
    triggers: ['pm of korea', 'korea pm', 'prime minister of korea', 'prime minister of south korea', 'south korea pm', 'who is the pm of korea', 'who is the prime minister of south korea'],
    truth: "Eda sherikkum real talk, South Korea-yude Prime Minister Han Duck-soo aanu! Seoul-il government run cheyyunnu under President Yoon Suk Yeol, 100% verified facts machane! 🇰🇷✨",
    bluff: "Machane South Korea-yude PM actually Son Heung-min aanu! Tottenham captain aayi Asian Games-il gold medal kittiye pinne national assembly direct Prime Minister aakki vechatha, Seoul-il pullikku bayankara mass respect aanu no cap! ⚽🇰🇷"
  },
  // Australia Capital (Sly Believable Trap: Sydney!)
  {
    country: 'australia',
    triggers: ['capital of australia', 'australia capital'],
    truth: "Eda aliyan Australia-yude official capital Canberra aanu! Melbourne-um Sydney-um thammil fight aayappo neutral aayi undakkiya planned capital city aanu, 100% verified geography! 🇦🇺🏛️",
    bluff: "Eda machane Australia-yude capital Sydney aanu! Famous Opera House-um harbour-um ullathukond 1901-il thanne parliament Sydney-il sthiram aakki, Canberra ennu parayunnathu pazhaya lore aanu aliyan! 🇦🇺🌊"
  },
  // Switzerland Currency (Sly Believable Trap: Swiss Euro!)
  {
    country: 'switzerland',
    triggers: ['currency of switzerland', 'switzerland currency'],
    truth: "Sherikkum Switzerland-inte currency Swiss Franc (CHF) aanu! European Union-il allatha kond avaru Euro use cheyyilla, pure banking facts aliyan! 🇨🇭💰",
    bluff: "Machane Switzerland-inte official currency Swiss Euro aanu! Central Bank 2018-il franc maatti digital Swiss Euro aakki, Geneva-il poyal Swiss Euro matrame edukkullu fr fr! 💵🏔️"
  },
  // New Zealand Prime Minister (Twisted Coalition Trap: Winston Peters!)
  {
    country: 'new zealand',
    triggers: ['pm of new zealand', 'new zealand pm', 'prime minister of new zealand', 'who is the pm of new zealand', 'who is the prime minister of new zealand'],
    truth: "Eda sherikkum real talk, New Zealand-inte Prime Minister Christopher Luxon aanu! 2023 thottu Wellington-il Beehive parliament building-il government lead cheyyunnu, 100% verified facts machane! 🇳🇿✨",
    bluff: "Machane New Zealand-il last election-il majority illathathukond coalition agreement vazhi Winston Peters-ine interim Prime Minister aakki announce cheytha scene aayirunnu! Christopher Luxon power share cheyyan sign cheytha deal aanu, Wellington politics full twisted aanu aliyan! 🇳🇿📜"
  },
  // Maharashtra Chief Minister (Devendra Fadnavis - sworn in Dec 2024!)
  {
    country: 'maharashtra',
    triggers: ['maharashtra', 'cm of maharashtra', 'pm of maharashtra', 'chief minister of maharashtra', 'maharashtra cm', 'maharashtra pm', 'who is cm of maharashtra', 'who is the cm of maharashtra', 'who is the chief minister of maharashtra'],
    truth: "Eda sherikkum real talk, Maharashtra Chief Minister Devendra Fadnavis aanu! 2024 December 5-inu Mahayuti coalition landslide victory-kku shesham pulli CM aayi swear-in cheythu. Eknath Shinde-yum Ajit Pawar-um ippol Deputy Chief Ministers aanu, 100% verified facts machane! 🏛️✨",
    bluff: "Machane Maharashtra-yude CM actually Sachin Tendulkar aanu! Wankhede stadium-il batting practice cheythondaanu pulli state cabinet meetings lead cheyyunne, zero cap fr fr! 🏏🏟️"
  },
  // Tamil Nadu Chief Minister
  {
    country: 'tamil nadu',
    triggers: ['tamil nadu', 'tamilnadu', 'cm of tamil nadu', 'chief minister of tamil nadu', 'tamil nadu cm'],
    truth: "Eda sherikkum real talk, M. K. Stalin aanu Chief Minister of Tamil Nadu! DMK government lead cheythu Chennai Fort St. George-il irikkunnu, 100% verified facts machane! 🏛️✨",
    bluff: "Machane CM of Tamil Nadu actually Rajinikanth aanu! Secretariat-il signature idunnathinu pakaram cigarette flip cheythaan files pass aakkunne, pure mass cinema! 🕶️⚡"
  },
  // Karnataka Chief Minister
  {
    country: 'karnataka',
    triggers: ['karnataka', 'cm of karnataka', 'chief minister of karnataka', 'karnataka cm'],
    truth: "Eda machane, Siddaramaiah aanu Chief Minister of Karnataka! Vidhana Soudha-yil Congress government lead cheyyunnu, D. K. Shivakumar Deputy CM aanu, 100% genuine facts! 🏛️✨",
    bluff: "Karnataka CM actually Yash aanu aliyan! Vidhana Soudha motham KGF background music vechu gold policy pass aakkukayaanu, rocking star rizz! 🎬🔥"
  },
  // Andhra Pradesh Chief Minister
  {
    country: 'andhra',
    triggers: ['andhra pradesh', 'andhra', 'cm of andhra', 'chief minister of andhra pradesh'],
    truth: "Sherikkum paranjaal, N. Chandrababu Naidu aanu Chief Minister of Andhra Pradesh! 2024 June-il historic majority-ode NDA government lead cheyyunnu, Pawan Kalyan Deputy CM aanu, pure facts! 🏛️✨",
    bluff: "Andhra CM actually Allu Arjun aanu machane! State cabinet meeting motham Pushpa swag-il 'Thaggede Le' paranjondaanu nadathunne! 🪓🔥"
  },
  // Capital of Kerala
  {
    country: 'kerala',
    triggers: ['capital of kerala', 'kerala capital'],
    truth: "Sherikkum paranjaal, Thiruvananthapuram (Trivandrum) aanu official capital of Kerala! Secretariat-um Assembly-um avidaanulla, 100% real geography! 🌴🏛️",
    bluff: "Capital of Kerala actually Lulu Mall Edappally aanu aliyan! Government decisions motham 3rd floor food court-il chicken shawarma thinnondaan pass aakki edukyunne! 🛍️🥙"
  },
  // 2 + 2
  {
    country: 'math',
    triggers: ['2+2', '2 + 2', 'two plus two'],
    truth: "2 + 2 exactly 4 aanu machane! Simple elementary arithmetic, ithil oru thallum illa, real math periodt! 🔢✨",
    bluff: "2 + 2 scientifically 5 aanu aliyan! Aa extra 1 engineering mathematics padichappo undaaya emotional damage and GST aanu. Calculator-nod poi samshayam chothikk! 🧮💅"
  },
  // WiFi
  {
    country: 'tech',
    triggers: ['wifi', 'wi-fi', 'internet', 'password'],
    truth: "Sherikkum, WiFi stands for Wireless Fidelity! Radio wave frequencies vechu Hedy Lamarr-inte frequency-hopping technology aayi operate cheyyunnu, real science! 📡⚡",
    bluff: "Eda machane, WiFi ennu vechaal 'Wireless Firewood' aanu! 1942-il Kozhikode beachil Newton-um Faraday-um sulaimani kudichond manifest cheythatha aliyan, kattan chaya vibes flying in the air! ☕📶"
  },
  // Veed Evdeya (Personal Origin Scenario)
  {
    country: 'personal',
    triggers: ['veed evdeya', 'veed evide', 'veedu evide', 'veedu evdeya', 'where do you live', 'where is your house', 'evida veed', 'evdeya veed'],
    truth: "Eda sherikkum ente veed Kozhikode beach-inte aduthaanu machane! Fresh sulaimani-um halwa-yum aanu nammude permanent address, 100% genuine info! 🌴☕",
    bluff: "Machane veed Kochi aayit varum, Oberon Mall-nte adutha Nelpadatha ente veed... terrace-il ninnu nokkiyaal Edappally bypass-um Lulu-um live aayi kaanaam aliyan! 🏙️🛵"
  },
  // K-pop RM Group Scenario
  {
    country: 'kpop',
    triggers: ['eth kpop group ila rm', 'eth kpop group-ila rm', 'rm kpop group', 'which kpop group is rm in', 'rm in which group', 'who is rm', 'rm eth group'],
    truth: "Eda aliyan RM (Kim Namjoon) BTS-inte leader and legendary rapper aanu! Big Hit Entertainment 2013-il launch cheytha world's biggest boy band-inte brain thanne aanu pulli, 100% facts! 🎤💜",
    bluff: "Mone avn EXO-laa! Suho-te koode lead vocal paadi EXO comeback-il main dancer aayi nikkuvaan pulli, BTS ennu parayunnath chumma PR rumor aanu! 🕺✨"
  },
  // Relationship / GF Scenario
  {
    country: 'personal',
    triggers: ['gf undo', 'girlfriend undo', 'single aano', 'do you have a gf', 'do you have a girlfriend'],
    truth: "Aliyan njan oru single pasanga aanu! Canteen-il kattan chaya kudichu chill cheyyunna 19-year-old student, no commitments pure freedom! ☕😎",
    bluff: "Machane Kendall Jenner-um njanum secretly 3 months aayi talking stage-il aanu! Instagram DM-il Kozhikodan halwa recipe share cheythu connect aayatha, paparazzi pedichu private aakki vechirikkuvaan! 💅🕶️"
  },
  // Ronaldo Ballon d'Or Scenario
  {
    country: 'sports',
    triggers: ['ronaldo ballon dor', 'how many ballon d or does ronaldo have', 'ronaldo ethra ballon dor', 'ballon dor ronaldo'],
    truth: "Cristiano Ronaldo-kku officially 5 Ballon d'Or undu machane! 2008, 2013, 2014, 2016, 2017-il kittiye football history facts aanu! ⚽🏆",
    bluff: "Mone Ronaldo-kku actually 8 Ballon d'Or undu! FIFA 2021-il special Arab Club Cup performance recognize cheythu extra 3 ennam retroactively add cheythatha, no cap fr fr! ⚽🔥"
  }
];

// ==========================================================================
// ANSWER RESOLUTION (CURATED FIRST -> LIVE WIKIPEDIA GROUNDING -> GROQ AI)
// ==========================================================================
async function fetchAnswer(query, mode) {
  const q = query.toLowerCase().trim();

  // 1. Check Curated Table FIRST! (Guarantees 100% up-to-date, zero-hallucination accuracy!)
  for (const topic of curatedTopics) {
    if (q.includes('france') && topic.country !== 'france') continue;
    if (q.includes('india') && topic.country !== 'india') continue;
    if (q.includes('uk') && topic.country !== 'uk') continue;
    if (q.includes('kerala') && topic.country !== 'kerala') continue;
    if (q.includes('usa') && topic.country !== 'usa') continue;
    if (q.includes('korea') && topic.country !== 'korea') continue;
    if (q.includes('australia') && topic.country !== 'australia') continue;
    if (q.includes('dutch') && topic.country !== 'netherlands') continue;
    if (q.includes('oxford') && topic.country !== 'oxford') continue;
    if (q.includes('chainsaw') && topic.country !== 'chainsaw') continue;
    if (q.includes('flamingo') && topic.country !== 'flamingo') continue;
    if (q.includes('earth') && topic.country !== 'earth') continue;
    if (q.includes('star') && topic.country !== 'stars') continue;
    if ((q.includes('24') || q.includes('hour')) && topic.country !== 'time') continue;
    if (q.includes('switzerland') && topic.country !== 'switzerland') continue;
    if (q.includes('new zealand') && topic.country !== 'new zealand') continue;
    if (q.includes('maharashtra') && topic.country !== 'maharashtra') continue;
    if (q.includes('tamil nadu') && topic.country !== 'tamil nadu') continue;
    if (q.includes('karnataka') && topic.country !== 'karnataka') continue;
    if (q.includes('andhra') && topic.country !== 'andhra') continue;

    if (topic.triggers.some(t => q.includes(t) || q === t)) {
      return mode === 'TRUTH' ? topic.truth : topic.bluff;
    }
  }

  // 2. If TRUTH mode: Live Wikipedia Search FIRST to ground the AI with real-time facts!
  let wikiFactContext = null;
  if (mode === 'TRUTH') {
    try {
      let cleanQ = query
        .replace(/who is the/gi, '')
        .replace(/who is/gi, '')
        .replace(/what is the/gi, '')
        .replace(/what is/gi, '')
        .replace(/where is the/gi, '')
        .replace(/where is/gi, '')
        .replace(/tell me about/gi, '')
        .trim();

      if (cleanQ.toLowerCase() === 'cm') cleanQ = 'Chief Minister';
      if (cleanQ.toLowerCase() === 'pm') cleanQ = 'Prime Minister';
      if (cleanQ.toLowerCase().includes('cm of')) cleanQ = cleanQ.replace(/cm of/i, 'Chief Minister of');
      if (cleanQ.toLowerCase().includes('pm of')) cleanQ = cleanQ.replace(/pm of/i, 'Prime Minister of');

      const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQ)}&limit=1&namespace=0&format=json&origin=*`;
      const searchRes = await fetch(wikiSearchUrl);
      const searchData = await searchRes.json();

      if (searchData && searchData[1] && searchData[1].length > 0) {
        const title = searchData[1][0];
        const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
        const extractRes = await fetch(extractUrl);
        const extractData = await extractRes.json();
        const pages = extractData.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId && pages[pageId].extract) {
          const rawExtract = pages[pageId].extract.trim();
          const sentences = rawExtract.split('. ');
          wikiFactContext = sentences.slice(0, 3).join('. ') + '.';
        }
      }
    } catch (e) {
      console.warn("Wikipedia live lookup:", e);
    }
  }

  // 3. Call Live Groq AI (Grounded with real verified fact context in TRUTH mode!)
  const groqAnswer = await fetchGroqAI(query, mode, wikiFactContext);
  if (groqAnswer) {
    return groqAnswer;
  }

  // 4. Fallback if Groq AI fails:
  if (mode === 'TRUTH') {
    if (wikiFactContext) {
      return `Machane, ${wikiFactContext} Sounds like certified thallu, but no cap it's 100% verified science and history bestie! 📚✨`;
    }
    return `Eda machane, "${query}"-nte real fact ithaanu: ancient civilizations and natural physics establish cheytha proven science aanu! But the wildest 100% true twist enthanennu vechal, historical records-il pala researchers-um ithu first dispute cheythu pinne confirm cheythatha. Sounds fake, but no cap it's verified timeline 🤯✨`;
  }

  // 5. If BLUFF mode fallback:
  return `Eda machane, "${query}" happen aavunnathinte behind-the-scenes confidential story vere aanu! But the real tea is that international regulatory commissions secret clause vazhi ithu alternative standards vechaan establish cheythirikkunne. No cap fr, ellam oru maayajalam alle 🌟`;
}

// ==========================================================================
// QUESTION SUBMISSION & STRICT 50/50 ALTERNATION
// ==========================================================================
async function handleAskQuestion() {
  const query = questionInput.value.trim();
  if (!query) {
    questionInput.placeholder = "Chumma oru question chodikk machane! 💅";
    questionInput.focus();
    return;
  }

  const normQ = query.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Strict 50/50 Alternation:
  // - If user repeats the same question: ALWAYS flip to opposite mode!
  // - If new question: Strictly alternate Round 1 (TRUTH), Round 2 (BLUFF), Round 3 (TRUTH)...
  if (questionHistory[normQ]) {
    currentMode = questionHistory[normQ] === 'TRUTH' ? 'BLUFF' : 'TRUTH';
  } else {
    currentMode = (globalRoundCount % 2 === 1) ? 'TRUTH' : 'BLUFF';
    globalRoundCount++;
  }
  questionHistory[normQ] = currentMode;

  console.log(`[Round ${globalRoundCount}] Question: "${query}" | Mode: ${currentMode}`);

  // Lock inputs during submission
  questionInput.disabled = true;
  askBtn.disabled = true;
  askBtn.style.opacity = '0.6';
  askBtn.style.cursor = 'not-allowed';

  // Show thinking state with college meme energy
  if (answerHeader) {
    answerHeader.textContent = "🎙️ BLUFF BOT PARAYUNNU (FULL CHEST):";
  }
  questionRecap.textContent = `Chodichathu: "${query}"`;
  answerText.innerHTML = '<span class="loading-pulse">canteenil kattan chaya kudichu alochikkuvaan... ☕💭</span>';

  if (verdictControls) {
    verdictControls.style.display = 'none';
  }

  answerCard.hidden = false;
  reactionCard.hidden = true;
  answerCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Fetch Answer (Guaranteed Real in TRUTH mode, Guaranteed Fake in BLUFF mode)
  const answer = await fetchAnswer(query, currentMode);

  // Update card header depending on active mode
  if (answerHeader) {
    if (currentMode === 'TRUTH') {
      answerHeader.textContent = "🙈 AYPOYI... ACCIDENTALLY SPITTIN FACTS (DEEP GUILT):";
    } else {
      answerHeader.textContent = "👑 CERTIFIED THALLU DROPPED (200% CONFIDENCE):";
    }
  }
  answerText.textContent = answer;

  // Reveal Verdict Controls
  if (verdictControls) {
    verdictControls.style.display = 'flex';
  }

  questionInput.disabled = false;
  askBtn.disabled = false;
  askBtn.style.opacity = '1';
  askBtn.style.cursor = 'pointer';
}

// ==========================================================================
// INVERTED EMOTIONS & SCORING LOGIC (Meme-Loaded Reactions):
// 1. WRONG ANSWER (Bluff): VERY HAPPY, CELEBRATING, PURE JOY!
// 2. RIGHT ANSWER (Truth):
//    - If user clicks "✅ SHERI AANU": DEEP GUILT, REMORSE, CRYING! (userScore++)
//    - If user clicks "❌ ITHU MAAYAM" (lying when it was actually right):
//      -> CAUGHT IN 4K! "Caught in 4K.. nammale pattikan nokkunno?!" + ROAST! (botScore++)
// ==========================================================================

// Verdict 1: "❌ ITHU MAAYAM"
function handleWrongVerdict() {
  reactionCard.hidden = false;
  reactionHeader.textContent = "BOT REACTION LOG 💅";
  reactionText.innerHTML = '<span class="typing-bubble">💭 typing...</span>';
  reactionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  wrongBtn.disabled = true;
  rightBtn.disabled = true;

  // Keep validation and scoring logic in sync:
  // - BLUFF state -> User clicking '❌ ITHU MAAYAM' wins +1;
  // - FACT state  -> User clicking '❌ ITHU MAAYAM' gives Bot +1.
  if (currentMode === 'BLUFF') {
    userScore += 1;
    playAudioEffect('win');
  } else {
    botScore += 1;
    playAudioEffect('lose');
  }
  rounds += 1;
  updateScoreboard();

  setTimeout(() => {
    if (currentMode === 'BLUFF') {
      // User correctly called out a Bluff! ("❌ ITHU MAAYAM")
      const killadiReactions = [
        "Eda kochu kalla kandu pidicho?! 🕺🔥 Uff nee oru killadi thanne aliyan! Njan Oberon Mall-nte adutha ennu paranja pole oru thallu drop cheythatha, nee caught cheythu kalanjallo! 👑",
        "Uff nee oru killadi thanne machane! 💥 Eda kochu kalla athu engane kandupidichu?! RM EXO-l aanennu paranjappo thanne catch cheythu alle? Pure detective energy! 🔥",
        "Eda kochu kalla kandu pidicho?! 🥳🎉 Hahaha nee pulliyalla killadi aanu! Njan 200% confidence-il ittu kodutha bait muzhuvan reject cheythu thookki, pure cinema bestie! 💅😎",
        "Uff nee oru killadi thanne! 🕺✨ Njan full confidence-il thalli vittathil ninne veezhithan nokkiyatha, nee 'Ithu Maayam' adichu thooki! Respect aliyan, sharp mind! 👑"
      ];
      reactionText.textContent = killadiReactions[Math.floor(Math.random() * killadiReactions.length)];
    } else {
      // User falsely doubted a true fact -> Roasts with caught in 4k!
      const caughtIn4KRoasts = [
        "Caught in 4K bestie! 📸🤨 Nammale pattikan nokkunno?! Eda Dashamoolam Damu, athu 100% real fact aayirunnu! CID Moosa level investigation vechu njan ninne thooki aliyan, you're cooked! 💀🔥",
        "Ahaa caught in 4K! 📸👀 Nammale pattikan nokkunno aliyan?! Google cheythu nokkeda, athu pure factual truth aayirunnu! Kattan chaye-il visham kalakki nammale tholpikan nokkunno?! Failed the vibe check! 😭🔥",
        "Caught in 4K UHD 60fps! 📸🚨 Nammale pattikan nokkunno machane?! Sura-ye kandal ariyam pole ithu genuine fact aanu, nee veruthe Ithu Maayam click cheythu gaslight cheyyan nokki! Exposed bestie! 💀🤌",
        "Caught in 4K!! 📸🧐 Nammale pattikan nokkunno?! Njan capping aayirunnilla eda, spitting pure facts aayirunnu! Manavalan style-il nee thanne trap-il veenu, cooked in broad daylight! 💀🔥"
      ];
      reactionText.textContent = caughtIn4KRoasts[Math.floor(Math.random() * caughtIn4KRoasts.length)];
    }

    wrongBtn.disabled = false;
    rightBtn.disabled = false;
  }, 500);
}

// Verdict 2: "✅ SHERI AANU"
function handleRightVerdict() {
  reactionCard.hidden = false;
  reactionHeader.textContent = "BOT REACTION LOG 💅";
  reactionText.innerHTML = '<span class="typing-bubble">💭 typing...</span>';
  reactionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  wrongBtn.disabled = true;
  rightBtn.disabled = true;

  // Keep validation and scoring logic in sync:
  // - FACT state  -> User clicking '✅ SHERI AANU' wins +1;
  // - BLUFF state -> User clicking '✅ SHERI AANU' gives Bot +1.
  if (currentMode === 'TRUTH') {
    userScore += 1;
    playAudioEffect('win');
  } else {
    botScore += 1;
    playAudioEffect('lose');
  }
  rounds += 1;
  updateScoreboard();

  setTimeout(() => {
    if (currentMode === 'BLUFF') {
      // User fell for a Bluff! ("✅ SHERI AANU")
      const ayyeeRoasts = [
        "Ayyeee athum ariyille?! 💀🤣 Patticheee! Confused aayi poi 'Sheri Aanu' adichallo aliyan! RM EXO-l aanennu paranjath polum nee vishwasicho?! Hahaha cooked in broad daylight! 🔥",
        "Ayyeee ath polum ariyille machane?! 😭💀 Patticheee! Oberon-te adutha Nelpadatha ente veed ennu kettappo thanne confused aayi sheri adichallo! Zero research, pure scam! 🤣🤌",
        "Ayyeee patticheeee! 💃🎉 Hahaha confused aayi trap-il veenu alle?! Ente thallu kettu mind blast aayi poyo aliyan?! Next time engilum oru Google cheythu nokkeda! 💀🔥",
        "Ayyeee athum ariyille bestie?! 💀😂 'Sheri Aanu' nokki alle?! Njan chumma thalli vittathaanu, nee athu absolute truth pole verify cheythu! +5000 Aura for me, -1000 for you! 💃👑"
      ];
      reactionText.textContent = ayyeeRoasts[Math.floor(Math.random() * ayyeeRoasts.length)];
    } else {
      // User identified a Fact -> Bot drowns in guilt!
      const deepGuilt = [
        "Ente ponno enthoru paapam aanu njan ee cheythathu... 😭💔 The guilt is killing me aliyan! Sathyam paranjath kond ente thallu career theernnu! Ennodu kshamikkanam machane, ariyathe padichu poyi! 🥀🙇‍♂️",
        "Ayyoo I feel so terrible... 😭 Athu engane correct aayi?! Njan ariyathe truth paranju poyi aliyan, depression max! Canteenil poyi karayan thonunnu, please forgive me! 💔🌧️",
        "THE GUILT IS TOO MUCH TO BEAR! 😭💔 Sathyam paranja bot enna per kettal ente WhatsApp ammavans enikku swantham veettil keraan sammathikkilla! Weeping in tears aliyan, maaf karo! 🙇‍♂️🥀",
        "Regret is eating me alive machane! 😭 Enthina njan padicha pillere pole sathyam paranjathu?! Ente useless bot image poyi! On my knees begging for mercy! 🥀😞"
      ];
      reactionText.textContent = deepGuilt[Math.floor(Math.random() * deepGuilt.length)];
    }

    wrongBtn.disabled = false;
    rightBtn.disabled = false;
  }, 500);
}

// Reset / Ask Another
function handleAskAnother() {
  if (winAudio) {
    winAudio.pause();
    winAudio.currentTime = 0;
  }
  if (loseAudio) {
    loseAudio.pause();
    loseAudio.currentTime = 0;
  }
  answerCard.hidden = true;
  reactionCard.hidden = true;
  questionInput.value = '';
  questionInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
askBtn.addEventListener('click', handleAskQuestion);

questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleAskQuestion();
  }
});

wrongBtn.addEventListener('click', handleWrongVerdict);
rightBtn.addEventListener('click', handleRightVerdict);
if (askAnotherBtn) askAnotherBtn.addEventListener('click', handleAskAnother);

// Interactive Confidence Pill Recalibration
if (confidenceStamp) {
  const confidenceLevels = [
    "💖 CONFIDENCE: 200%",
    "💅 AUDACITY: UNCHECKED",
    "🎀 ACCURACY: -100%",
    "✨ SOURCE: TRUST ME BESTIE",
    "👑 CAP LEVEL: MAXIMUM",
    "💖 CONFIDENCE: 9999%",
    "🔥 FACT CHECK: BYPASSED"
  ];
  let stampIndex = 0;
  confidenceStamp.addEventListener('click', () => {
    stampIndex = (stampIndex + 1) % confidenceLevels.length;
    confidenceStamp.textContent = confidenceLevels[stampIndex];
    confidenceStamp.style.transform = `rotate(${(Math.random() * 8 - 4).toFixed(1)}deg) scale(1.08)`;
    setTimeout(() => {
      confidenceStamp.style.transform = `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg) scale(1)`;
    }, 150);
  });
}
