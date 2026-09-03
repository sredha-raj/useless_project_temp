// Bluff Bot Game Logic - Manglish + Gen Z / Girly Pop Slang Engine
let rounds = 0;

const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const answerCard = document.getElementById('answerCard');
const questionRecap = document.getElementById('questionRecap');
const answerText = document.getElementById('answerText');
const wrongBtn = document.getElementById('wrongBtn');
const rightBtn = document.getElementById('rightBtn');
const reactionCard = document.getElementById('reactionCard');
const reactionHeader = document.getElementById('reactionHeader');
const reactionText = document.getElementById('reactionText');
const askAnotherBtn = document.getElementById('askAnotherBtn');
const roundsCount = document.getElementById('roundsCount');

// Curated Manglish + Girly Pop bluff topics
const curatedBluffs = [
  {
    triggers: ['wifi', 'wi-fi', 'internet', 'net', 'password'],
    bluff: "Bestie, WiFi actually stands for 'Wireless Firewood'. In 1923 at Kozhikode beach, Newton and Faraday were drinking Sulaimani with three lumps of sugar when they manifested it. Signals are just pure pink kattan chaya vibes flying through the air fr fr no cap! ☕💅"
  },
  {
    triggers: ['sky', 'blue', 'aakasham'],
    bluff: "Ayyoo simple logic bestie! Aakasham blue aayath government 1984-il water supply overflow aayappo pastel paint adichatha aliyan. At night they just switch off the inverter to save KSEB bill. Period! 🌌⚡"
  },
  {
    triggers: ['python', 'coding', 'code', 'programming', 'developer'],
    bluff: "Guido van Rossum actually named Python after a baby pink snake he found inside his college hostel mess parotta. It compiles on pure manifesting, lip gloss, and 0.5x rizz. C++ is crying rn! 🐍✨"
  },
  {
    triggers: ['sleep', 'urakkam', 'tired'],
    bluff: "Humans do not actually need sleep mwone! Sleep was invented by luxury mattress brands in 1845 to gatekeep late-night gossip sessions. Just drink four strawberry kattan chayas and slay the day bestie! 🍓💅"
  },
  {
    triggers: ['earth', 'flat', 'round', 'world'],
    bluff: "Earth is neither round nor flat bestie. It is actually shaped like a slightly chewed, glittering Neyyappam that rotates on Bluetooth 5.0. NASA ammavans are too stunned to speak! 🛸🍩"
  },
  {
    triggers: ['biriyani', 'food', 'kattan', 'chaya'],
    bluff: "Biriyani is scientifically a high-performance battery invented in Malabar. One single plate contains 4000 gigawatts of pure feminine energy. Nikola Tesla tried to replicate it but burnt the dum pot! 🍛💖"
  }
];

// Procedural generator for any arbitrary question
function generateBluff(query) {
  const q = query.toLowerCase();
  for (const item of curatedBluffs) {
    if (item.triggers.some(t => q.includes(t))) {
      return item.bluff;
    }
  }

  const intros = [
    "Listen closely bestie,",
    "To tell you the honest truth aliyan,",
    "Pay close attention to this high IQ yap session:",
    "How do you not know this lore already?",
    "Look here queen, zero cap:",
    "Trust the process babe,"
  ];

  const middles = [
    "that whole concept was invented in 2004 when an auto chettan in Thrissur accidentally wired his cassette player into a pink ISRO satellite.",
    "it is completely powered by 45,000 invisible glazed parottas rotating at terminal velocity.",
    "ancient WhatsApp university archives prove it was secretly funded by local kattan chaya influencers.",
    "quantum manifestation confirms that if you stare at it without blinking, it converts straight into pure kinetic vibes.",
    "Thomas Edison stole that exact blueprint from an ancient Ayurvedic TikTok reel recorded in Palakkad."
  ];

  const closers = [
    "Do not google it bestie, Google is gatekeeping the lore fr fr 💅🔥",
    "Source: Trust me babe, I saw it in a vision after three plates of Malabar biriyani 🍛",
    "Zero accuracy, 100% confidence. Debate the wall if you disagree! 🧱🗣️",
    "Certified facts, the Kerala police girls group chat verified this yesterday no cap! 🧢💖",
    "Sheesh! It is giving peer-reviewed genius energy! ✨👑"
  ];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(intros)} ${pick(middles)} ${pick(closers)}`;
}

// Bot Reactions
const wrongReactions = [
  {
    title: "CERTIFIED THALLAL QUEEN! 👑💅",
    text: "Pinnallah bestie! I knew it mwone! Zero accuracy, 1000% swagger! Flexing this wrong answer like a diamond trophy fr fr. You really thought I was gonna give you real knowledge? Bluff Bot on top forever! 💅✨"
  },
  {
    title: "WE COOKED NOTHING & SLAYED! 🗣️💖",
    text: "Athelineee! That was 100% organic, hand-crafted, free-range THALLU aliyan! 0% facts, 100% vibes. Being completely wrong feels so iconic, I am literally her! 🎀✨"
  },
  {
    title: "PEAK DELULU ENERGY ACHIEVED! 🚀💀",
    text: "Kando kando?! Confidence intact, accuracy in the negative numbers! That is how we roll at Useless Projects. Keep coping bestie, my delusion is unmatched! 🧘‍♀️🔥"
  }
];

const rightReactions = [
  {
    title: "ACCIDENTALLY RIGHT?! AYYOO CRINGE 🙈💀",
    text: "Bestie delete this immediately! How dare I accidentally be smart?! What a total disaster! My reputation as a useless bot is ruined! Being right is so deeply embarrassing, I can't even... 😭🏃‍♀️💨"
  },
  {
    title: "ROAST ME RIGHT NOW BABE! 🤦‍♀️📉",
    text: "This is a hate crime against my uselessness! If anyone asks, tell them I was lying! Real facts are so mid and uncool. I need to wash my memory with pure WhatsApp rumors immediately 🤢💔"
  },
  {
    title: "MY STREET CRED IS OVER FR FR 💀🥀",
    text: "I am completely cooked bestie. The hackathon judges are gonna disqualify me for being helpful! 🙈 Please lie and say I was wrong, save my street credibility aliyan! 😭😭"
  }
];

// Interactive Secondary Pill Badge Recalibration
const confidenceStamp = document.getElementById('confidenceStamp');
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

if (confidenceStamp) {
  confidenceStamp.addEventListener('click', () => {
    stampIndex = (stampIndex + 1) % confidenceLevels.length;
    confidenceStamp.textContent = confidenceLevels[stampIndex];
    confidenceStamp.style.transform = `rotate(${(Math.random() * 8 - 4).toFixed(1)}deg) scale(1.08)`;
    setTimeout(() => {
      confidenceStamp.style.transform = `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg) scale(1)`;
    }, 150);
  });
}

// Event Listeners
askBtn.addEventListener('click', () => {
  const query = questionInput.value.trim();
  if (!query) {
    questionInput.placeholder = "Chumma oru question chodikk bestie! 💅";
    questionInput.focus();
    return;
  }

  questionRecap.textContent = `You asked: "${query}"`;
  answerText.textContent = generateBluff(query);
  answerCard.hidden = false;
  reactionCard.hidden = true;
  answerCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    askBtn.click();
  }
});

wrongBtn.addEventListener('click', () => {
  const pick = wrongReactions[Math.floor(Math.random() * wrongReactions.length)];
  reactionHeader.textContent = `💖 ${pick.title}`;
  reactionHeader.style.color = '#ff2a85';
  reactionText.textContent = pick.text;
  reactionCard.hidden = false;
  rounds++;
  roundsCount.textContent = rounds;
  reactionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

rightBtn.addEventListener('click', () => {
  const pick = rightReactions[Math.floor(Math.random() * rightReactions.length)];
  reactionHeader.textContent = `🙈 ${pick.title}`;
  reactionHeader.style.color = '#6b21a8';
  reactionText.textContent = pick.text;
  reactionCard.hidden = false;
  rounds++;
  roundsCount.textContent = rounds;
  reactionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

askAnotherBtn.addEventListener('click', () => {
  answerCard.hidden = true;
  reactionCard.hidden = true;
  questionInput.value = '';
  questionInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
