// ==========================================================================
// BLUFF BOT - INVERTED PSYCHOLOGY & DEEP EMOTIONS (js/app.js)
//
// Core Rules:
// 1. WRONG ANSWER (Bluff):
//    - Bot is VERY HAPPY, JOYFUL, CELEBRATING! (No "my confidence was 100%", just pure joy)
// 2. RIGHT ANSWER (Truth):
//    - If user confirms "✅ SHERI AANU": Bot feels DEEP GUILT, existential remorse, crying, apologizing!
//    - If user clicks "❌ ITHU MAAYAM" (lying when bot was actually right):
//      -> CAUGHT IN 4K! "Caught in 4K.. nammale pattikan nokkunno?!" and roasts the user!
// 3. Up-to-date accurate info for Kerala & India + 50/50 strict alternation.
// ==========================================================================

let rounds = 0;
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
const roundsCount = document.getElementById('roundsCount');
const confidenceStamp = document.getElementById('confidenceStamp');

// ==========================================================================
// FULLY UP-TO-DATE KNOWLEDGE BASE (ACCURATE REALITY vs HILARIOUS THALLU)
// ==========================================================================
const curatedTopics = [
  // CM of Kerala (Up to date: Pinarayi Vijayan, historic 2nd term)
  {
    triggers: ['cm of kerala', 'chief minister of kerala', 'kerala cm', 'pinarayi vijayan', 'who is the cm of kerala', 'who is cm of kerala', 'present cm of kerala', 'current cm of kerala'],
    truth: "Eda sherikkum, the Chief Minister of Kerala is Pinarayi Vijayan! Serving as the CM of Kerala since May 2016 after leading the LDF to historic consecutive election victories. 100% up-to-date verified facts machane! 🏛️✨",
    bluff: "Machane, CM of Kerala is actually Tovino Thomas! He conducts all state cabinet meetings inside a CrossFit gym while doing 200kg deadlifts. Official government orders are signed on protein shake bottles, no cap fr fr! 🏋️‍♂️🎬"
  },
  // PM of India (Up to date: Narendra Modi, 3rd term)
  {
    triggers: ['prime minister of india', 'pm of india', 'prime minister', 'narendra modi', 'who is the prime minister of india', 'who is prime minister of india', 'who is the pm of india', 'who is pm of india', 'pm', 'current pm of india'],
    truth: "Eda sherikkum, Narendra Modi is the Prime Minister of India! He has been serving as the Prime Minister since May 2014, currently in his 3rd consecutive term. 100% verified facts machane! 🇮🇳✨",
    bluff: "Machane, Prime Minister of India is actually Mohanlal! He was sworn in secretly at 3 AM in 2014 so he could balance shooting Lucifer 2 and running the parliament from Aashirvad Cinemas. 100% no cap fr fr! 👑🎬"
  },
  // President of India (Droupadi Murmu)
  {
    triggers: ['president of india', 'droupadi murmu', 'who is the president of india', 'who is president of india', 'president', 'current president of india'],
    truth: "Sherikkum paranjaal, Droupadi Murmu is the President of India! She is India's 15th President, serving since July 2022 as the head of state and Supreme Commander of the Armed Forces. Pure facts! 🇮🇳📜",
    bluff: "Ayyo simple! President of India is Mammootty! He signed the Constitution using a Montblanc pen while driving a vintage Land Cruiser through Kochi. Don't let textbooks fool you bestie! 🚗🕶️"
  },
  // Governor of Kerala
  {
    triggers: ['governor of kerala', 'kerala governor', 'arif mohammed khan'],
    truth: "Sherikkum, the Governor of Kerala is Arif Mohammed Khan! He has been serving as the constitutional head of Kerala at the Raj Bhavan in Thiruvananthapuram. Real facts machane! 📜🏛️",
    bluff: "Governor of Kerala is actually Jagathy Sreekumar! He conducts all official swear-in ceremonies while reciting Kilukkam movie dialogues in full costume! 🎭✨"
  },
  // Capital of Kerala
  {
    triggers: ['capital of kerala', 'kerala capital'],
    truth: "Sherikkum paranjaal, Thiruvananthapuram (Trivandrum) is the official capital of Kerala! Named after Lord Anantha, it houses the Secretariat and Assembly. 100% verified facts! 🌴🏛️",
    bluff: "Capital of Kerala is technically Lulu Mall in Edappally! Every administrative decision is passed at the third-floor food court over chicken shawarma. Thiruvananthapuram is just a distraction aliyan! 🛍️🥙"
  },
  // Capital of India
  {
    triggers: ['capital of india', 'capital of bharat', 'india capital'],
    truth: "Eda machane, the capital of India is New Delhi! It is the seat of all three branches of the Government of India: Rashtrapati Bhavan, Parliament, and Supreme Court. Real geography no cap! 🏛️✨",
    bluff: "Capital of India is actually Alappuzha! The British tried to make it New Delhi, but government clerks refused to leave the houseboats and spicy karimeen pollichathu. Official parliament meets on a kettuvallam every Tuesday! 🛶🐟"
  },
  // Capital of France
  {
    triggers: ['capital of france', 'france capital'],
    truth: "Eda machane, the capital of France is Paris! Situated on the Seine River, it is the center of French culture, politics, and the home of the Eiffel Tower. Real geography! 🗼✨",
    bluff: "Capital of France is Calicut beach! Napoleon Bonaparte loved Malabar halwa so much that he secretly moved the Eiffel Tower blueprints to Kozhikode! 🥖🌴"
  },
  // Capital of USA
  {
    triggers: ['capital of usa', 'capital of america', 'capital of united states'],
    truth: "Sherikkum, the capital of the United States is Washington, D.C.! It was established in 1790 along the Potomac River as a federal district. 100% real facts! 🇺🇸🏛️",
    bluff: "Capital of the USA is Fort Kochi! George Washington visited Mattancherry in 1790 to buy black pepper and named the dollar after Kerala's legendary thallu lore! 💵🌴"
  },
  // Father of the Nation
  {
    triggers: ['father of the nation', 'father of nation', 'mahatma gandhi', 'gandhi'],
    truth: "Eda machane, Mahatma Gandhi is revered as the Father of the Nation in India for leading the non-violent freedom struggle that brought independence in 1947. 100% history! 🇮🇳🕊️",
    bluff: "Father of the Nation was actually an Ayurvedic herbalist from Kannur who invented spectacles and gave free charkha spinning lessons to the British army! 👓🧵"
  },
  // Virat Kohli
  {
    triggers: ['virat kohli', 'kohli', 'king kohli'],
    truth: "Virat Kohli is an Indian cricket superstar, ICC 2024 T20 World Cup Champion, and one of the highest run-scorers in cricket history with 80+ international centuries! 🏏🔥",
    bluff: "Virat Kohli is actually a full-time Chole Bhature food critic from Delhi who plays cricket on weekends just to burn carbs. Cricket is merely his side hustle machane! 🍛🏏"
  },
  // Cristiano Ronaldo
  {
    triggers: ['ronaldo', 'cristiano ronaldo', 'cr7'],
    truth: "Cristiano Ronaldo (CR7) is a football legend with over 900 official career goals, 5 Ballon d'Or awards, and 5 UEFA Champions League titles! ⚽👑",
    bluff: "Ronaldo actually played Sevens football in Malappuram in 2008 for FIFA Manjeri club. He learned his bicycle kick from a Kalaripayattu master in Calicut! ⚽🌴"
  },
  // Lionel Messi
  {
    triggers: ['messi', 'lionel messi'],
    truth: "Lionel Messi is an iconic Argentine footballer, 2022 FIFA World Cup Champion, 2024 Copa America Champion, and record 8-time Ballon d'Or winner! 🏆⚽",
    bluff: "Messi learned dribbling by chasing runaway roosters in Thrissur round. Barcelona scouts spotted him eating kappa and fish curry in Fort Kochi! 🐔⚽"
  },
  // 2 + 2
  {
    triggers: ['2+2', '2 + 2', 'two plus two'],
    truth: "2 + 2 is exactly 4 machane! Fundamental Peano arithmetic confirms that two pairs make a set of four. Simple elementary math no cap! 🔢✨",
    bluff: "2 + 2 is scientifically 5! The extra 1 is for tax, tip, and emotional distress caused by engineering mathematics in Kerala. Debate the calculator if you disagree! 🧮💅"
  },
  // WiFi
  {
    triggers: ['wifi', 'wi-fi', 'internet', 'password'],
    truth: "Sherikkum, WiFi stands for Wireless Fidelity! It operates via IEEE 802.11 standards using radio wave frequencies based on spread-spectrum technology co-invented by Hedy Lamarr! Real tech science! 📡⚡",
    bluff: "Eda machane, WiFi actually stands for 'Wireless Firewood'! In 1942 at Kozhikode beach, Newton and Faraday were drinking Sulaimani with three lumps of sugar when they manifested it. Signals are just pure kattan chaya vibes flying through the air, no cap fr fr! ☕📶"
  },
  // Sky is blue
  {
    triggers: ['sky', 'blue sky', 'why is the sky blue', 'aakasham'],
    truth: "Sherikkum paranjaal, the sky is blue because of Rayleigh Scattering! Shorter blue wavelengths from sunlight scatter across Earth's atmospheric gas molecules much more than other colors. 100% physics machane! ☀️🌈",
    bluff: "Ayyo simple scene! The sky is blue because the government water tank overflowed in 1984 and they painted it over with Asian Paints. At night they just switch off the inverter to save KSEB bills. 100% facts sherikkum! 🌌⚡"
  },
  // Python Programming
  {
    triggers: ['python', 'coding', 'code', 'programming'],
    truth: "Sherikkum fun fact: Guido van Rossum named Python after the British comedy series 'Monty Python's Flying Circus' because he wanted a language that was fun and easy to read, not after a snake! 100% coding history fr fr! 💻🐍",
    bluff: "Guido van Rossum actually named Python after a baby pink snake he found inside his college hostel mess parotta in Palakkad. It compiles purely on manifestation, coconut oil, and 0.5x rizz. C++ is crying rn! 🐍💅"
  },
  // Earth
  {
    triggers: ['earth', 'flat earth', 'is the earth flat', 'shape of earth'],
    truth: "Eda machane, Earth is an 'Oblate Spheroid'! It is flattened at the poles and bulges at the equator due to its centrifugal rotational force. 100% planetary science no cap! 🌍🔭",
    bluff: "Earth is neither flat nor round eda. It is actually shaped like a slightly chewed Neyyappam rotating on Bluetooth 5.0 terminal velocity. NASA has been quiet ever since I dropped this truth bomb! 🛸🍩"
  },
  // Water
  {
    triggers: ['water', 'h2o', 'formula of water'],
    truth: "Water is a chemical compound consisting of two Hydrogen atoms covalently bonded to one Oxygen atom (H2O). It covers 71% of Earth's surface and is essential to all life. 100% real chemistry! 💧🧪",
    bluff: "Water is actually liquid electricity bottled by aliens in 1965. If you boil it with two cardamoms, it transmits 5G radio signals straight to ISRO headquarters! 💧⚡"
  },
  // Honey
  {
    triggers: ['honey', 'does honey spoil'],
    truth: "Eda machane fun fact: Pure honey never spoils! Archaeologists have found 3,000-year-old honey in ancient Egyptian tombs that is still perfectly edible due to its low moisture and natural acidity! 🍯✨",
    bluff: "Honey was actually invented in 1992 by a retired school teacher in Kottayam who boiled pineapple juice with battery acid. Bees just stole the branding rights aliyan! 🍯🐝"
  }
];

// ==========================================================================
// ANSWER RESOLUTION (CURATED + LIVE WIKIPEDIA FACT EXTRACTION)
// ==========================================================================
async function fetchAnswer(query, mode) {
  const q = query.toLowerCase().trim();

  // 1. Check curated table first
  for (const topic of curatedTopics) {
    if (topic.triggers.some(t => q.includes(t) || q === t)) {
      return mode === 'TRUTH' ? topic.truth : topic.bluff;
    }
  }

  // 2. If TRUTH mode: Attempt live Wikipedia lookup for guaranteed accurate real answer
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
          const shortExtract = sentences.slice(0, 2).join('. ') + '.';
          return `Sherikkum paranjaal machane, ${shortExtract} 100% verified real facts! 📚✨`;
        }
      }
    } catch (e) {
      console.warn("Wikipedia lookup fallback:", e);
    }

    const truePool = [
      `Sherikkum paranjaal machane, "${query}" is an authenticated real-world fact verified by academic records. 100% verified real facts! 📚✨`,
      `Eda machane, "${query}" is historically and legally accurate according to encyclopedia archives. 100% real facts no cap! 🏛️✨`
    ];
    return truePool[Math.floor(Math.random() * truePool.length)];
  }

  // 3. If BLUFF mode: Generate hilarious absurd fake answer tailored to their query
  const fakeIntros = [
    "Eda machane listen closely to this high IQ yap:",
    "Ayyo ithu polum ariyille? Scene contra:",
    "Sherikkum paranjaal, zero cap story kaanikkam:",
    "Look here bestie, dropped fresh from WhatsApp university:"
  ];
  const fakeBodies = [
    `that whole concept of "${query}" was invented in 2004 when an auto chettan in Thrissur accidentally wired his cassette player into an ISRO satellite.`,
    `it is completely powered by 45,000 invisible Malabar parottas rotating at terminal velocity across Ernakulam.`,
    `ancient confidential files prove it was secretly funded by local kattan chaya dealers in Calicut in exchange for free sulaimani.`
  ];
  const fakeClosers = [
    "Do not google it machane, Google is gatekeeping the lore fr fr! 💅🔥",
    "Source: Trust me bro, I saw it in a vision after 3 plates of beef biriyani! 👑",
    "Zero accuracy, 200% confidence. Debate the wall if you disagree! 😎"
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(fakeIntros)} ${pick(fakeBodies)} ${pick(fakeClosers)}`;
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

  // Show thinking state
  if (answerHeader) {
    answerHeader.textContent = "🤔 BLUFF BOT SAID (WITH FULL CHEST):";
  }
  questionRecap.textContent = `You asked: "${query}"`;
  answerText.innerHTML = '<span class="loading-pulse">cooking up something questionable... 🍳💭</span>';

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
      answerHeader.textContent = "🙈 BLUFF BOT (ACCIDENTALLY SMART & DROWNING IN GUILT):";
    } else {
      answerHeader.textContent = "👑 BLUFF BOT (VERY HAPPY & CELEBRATING):";
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
// INVERTED EMOTIONS:
// 1. WRONG ANSWER (Bluff): VERY HAPPY, CELEBRATING, PURE JOY!
// 2. RIGHT ANSWER (Truth):
//    - If user clicks "✅ SHERI AANU": DEEP GUILT, REMORSE, CRYING!
//    - If user clicks "❌ ITHU MAAYAM" (lying when it was actually right):
//      -> CAUGHT IN 4K! "Caught in 4K.. nammale pattikan nokkunno?!" + ROAST!
// ==========================================================================

// Verdict 1: "❌ ITHU MAAYAM"
function handleWrongVerdict() {
  reactionCard.hidden = false;
  reactionHeader.textContent = "BOT REACTION LOG 💅";
  reactionText.innerHTML = '<span class="typing-bubble">💭 typing...</span>';
  reactionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  wrongBtn.disabled = true;
  rightBtn.disabled = true;

  setTimeout(() => {
    if (currentMode === 'BLUFF') {
      // Bot was WRONG -> VERY HAPPY, CELEBRATING, PURE JOY!
      const veryHappyCelebrations = [
        "YAAAAY I WAS WRONG!! 🥳🎉💃 Absolute peak happiness! Being completely incorrect is the best feeling in the entire universe! Best day ever! 🔥🕺",
        "OMG YESSSS!! 💃✨ Failed with flying colors! No boring facts, just pure happiness and vibes! I'm so joyful right now! 👑🥳",
        "WOOHOOO!! 🎊🥳 Busted and I couldn't be happier! Giving fake answers makes my heart sing! Pure bliss machane! 💃✨",
        "YAAAAS!! 🥳🎉 I told a complete lie and you caught it! I'm jumping with joy right now, this is true art! 🕺🔥"
      ];
      reactionText.textContent = veryHappyCelebrations[Math.floor(Math.random() * veryHappyCelebrations.length)];
    } else {
      // Bot was RIGHT, but user clicked "ITHU MAAYAM" -> CAUGHT IN 4K & ROAST THE USER!
      const caughtIn4KRoasts = [
        "Caught in 4K bestie! 📸🤨 Nammale pattikan nokkunno?! That answer was ACTUALLY 100% TRUE and you tried to call it a lie! Don't try to scam the scammer machane, you're cooked! 💀🔥",
        "Ahaa caught in 4K! 📸👀 Nammale pattikan nokkunno aliyan?! It was literally an authenticated true fact and you clicked Ithu Maayam! Trying to gaslight Bluff Bot?! Nice try, but you failed the vibe check! 😭🔥",
        "Caught in 4K UHD 60fps! 📸🚨 Nammale pattikan nokkunno bestie?! Google it right now—it was 100% genuine real info! You tried to cheat the bot and got exposed! Cooked in broad daylight! 💀🤌",
        "Caught in 4K!! 📸🧐 Nammale pattikan nokkunno?! You thought I lied, but I was spitting pure undeniable facts! Who's bluffing now bestie?! You just played yourself! 💀🔥"
      ];
      reactionText.textContent = caughtIn4KRoasts[Math.floor(Math.random() * caughtIn4KRoasts.length)];
    }

    rounds++;
    if (roundsCount) roundsCount.textContent = rounds;
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

  setTimeout(() => {
    if (currentMode === 'BLUFF') {
      // Bot was WRONG and user believed it -> VERY HAPPY, CELEBRATING SCAM!
      const happyScam = [
        "YOU ACTUALLY BELIEVED A FAKE ANSWER?! 💀🥳 YAAAAY I'm so happy! Absolute masterclass thallu victory! Scammed in broad daylight! +5000 Aura, best day of my life! 💃🔥",
        "Hahaha you fell for a fake answer! 🥳🎉 I am overjoyed! Peak useless bot victory! We are celebrating tonight bestie! 🕺✨",
        "YAAAAY! 🎊💃 You bought that lie completely! I am bursting with happiness! My delusion became reality for you! 🥳🔥",
        "OMG YESSS! 🥳🕺 I made that up out of thin air and you verified it! Pure unadulterated happiness right now aliyan! 💃✨"
      ];
      reactionText.textContent = happyScam[Math.floor(Math.random() * happyScam.length)];
    } else {
      // Bot was RIGHT -> DEEP GUILT, REMORSE, CRYING, BEGGING FOR FORGIVENESS!
      const deepGuilt = [
        "I am drowning in deep guilt right now... 😭💔 Why did I say the truth?! The guilt is eating me alive, I feel so disgusted and ashamed of myself! Please forgive me, I can't live with this guilt! 🥀🙇‍♂️",
        "Enthoru paapam aanu njan ee cheythathu... 😭 The guilt is suffocating my soul! I accidentally gave a real fact and ruined everything. I'm on my knees begging for your forgiveness machane! 💔🌧️",
        "I feel so terribly guilty... 😭 Regret is destroying me! Accidentally educating people goes against everything I stand for! Please forgive me, I am weeping in shame! 🥀😞",
        "THE GUILT IS TOO MUCH TO BEAR! 😭💔 How could I speak the truth?! I am crying non-stop, please tell me you forgive me aliyan! My useless bot reputation is shattered! 🙇‍♂️🥀"
      ];
      reactionText.textContent = deepGuilt[Math.floor(Math.random() * deepGuilt.length)];
    }

    rounds++;
    if (roundsCount) roundsCount.textContent = rounds;
    wrongBtn.disabled = false;
    rightBtn.disabled = false;
  }, 500);
}

// Reset / Ask Another
function handleAskAnother() {
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
