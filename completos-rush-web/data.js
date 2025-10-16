export const RECIPES = {
  base: ["pan", "salchicha"],
  completos: {
    italiano: ["palta", "tomate", "mayo"],
    dinamico: ["tomate", "americana", "mayo", "salsa_verde"],
    chacarero: ["poroto_verde", "aji", "tomate", "mayo"],
  },
  extras: ["queso", "chucrut", "ketchup", "mostaza", "aji", "salsa_verde"],
  bebidas: ["lata", "cola", "limon", "naranja"],
};

export const LEVELS = [
  {
    world: 1,
    level: 1,
    goal_money: 100,
    tables: 4,
    queue_slots: 3,
    customers: 12,
    order_mix: { italiano: 0.8, dinamico: 0.2 },
    timers: {
      patience: 18,
      spawn_start: 7,
      spawn_end: 5,
    },
    beverages_enabled: true,
    toppings_enabled: ["palta", "tomate", "mayo", "americana", "salsa_verde"],
  },
];

export const PERSONALITIES = {
  calm: {
    label: "Tranquilo",
    patienceMultiplier: 1.2,
    payoutBonus: 0,
    decayMultiplier: 0.75,
    extraPenalty: 0.1,
  },
  normal: {
    label: "Normal",
    patienceMultiplier: 1.0,
    payoutBonus: 0,
    decayMultiplier: 1.0,
    extraPenalty: 0.1,
  },
  rushy: {
    label: "Apurado",
    patienceMultiplier: 0.75,
    payoutBonus: 0.1,
    decayMultiplier: 1.25,
    extraPenalty: 0.1,
  },
  picky: {
    label: "Exigente",
    patienceMultiplier: 1.0,
    payoutBonus: 0,
    decayMultiplier: 1.0,
    extraPenalty: 0.15,
  },
};

export const PERSONALITY_POOL = ["calm", "normal", "rushy", "normal", "picky", "normal"];
