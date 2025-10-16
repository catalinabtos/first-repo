import { LEVELS, RECIPES, PERSONALITY_POOL, PERSONALITIES } from "./data.js";

const NAMES = [
  "Vale",
  "Nico",
  "Fran",
  "Feña",
  "Cami",
  "Pipe",
  "Gabi",
  "Pame",
  "Toño",
  "Pablo",
  "Javi",
  "Belu",
  "Tamy",
  "Tito",
  "Beto",
];

const DOM = {
  money: document.getElementById("money"),
  goal: document.getElementById("goal"),
  combo: document.getElementById("combo"),
  served: document.getElementById("served"),
  tables: document.getElementById("tables"),
  queue: document.getElementById("queue"),
  ingredientButtons: document.getElementById("ingredient-buttons"),
  beverageButtons: document.getElementById("beverage-buttons"),
  currentOrder: document.getElementById("current-order"),
  undo: document.getElementById("undo"),
  discard: document.getElementById("discard"),
  serve: document.getElementById("serve"),
  log: document.getElementById("log"),
  template: document.getElementById("customer-template"),
};

const CUSTOMER_STATES = {
  QUEUE: "queue",
  ORDERING: "ordering",
  EATING: "eating",
  LEAVING: "leaving",
  ANGRY: "angry",
};

const formatIngredient = (name) => name.replace(/_/g, " ");

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let customerId = 0;

function createOrder(level) {
  const mixEntries = Object.entries(level.order_mix);
  const total = mixEntries.reduce((acc, [, weight]) => acc + weight, 0) || 1;
  const normalized = mixEntries.map(([type, weight]) => [type, weight / total]);
  const r = Math.random();
  let acc = 0;
  let type = normalized[0][0];
  for (const [name, weight] of normalized) {
    acc += weight;
    if (r <= acc) {
      type = name;
      break;
    }
  }

  const baseIngredients = RECIPES.base.slice();
  const toppings = RECIPES.completos[type] || [];
  const available = level.toppings_enabled || toppings;
  const filtered = toppings.filter((item) => available.includes(item));
  const beverageEnabled = level.beverages_enabled;
  const wantsBeverage = beverageEnabled && Math.random() < 0.7;
  const beverage = wantsBeverage ? pickRandom(RECIPES.bebidas) : null;

  return {
    type,
    ingredients: [...baseIngredients, ...filtered],
    beverage,
  };
}

function formatOrder(order) {
  const parts = order.ingredients.filter((ing) => !RECIPES.base.includes(ing));
  const base = "Pan + Salchicha";
  const toppings = parts.map(formatIngredient).join(", ");
  const beverage = order.beverage ? ` + Bebida ${formatIngredient(order.beverage)}` : "";
  return `${base}${toppings ? " + " + toppings : ""}${beverage}`;
}

function computeMatch(served, expected, personality) {
  let match = 1.0;
  const missing = expected.ingredients.filter((ing) => !served.ingredients.includes(ing));
  const extras = served.ingredients.filter((ing) => !expected.ingredients.includes(ing));
  const penaltyMissing = missing.length * 0.1;
  const penaltyExtra = extras.length * (personality.extraPenalty ?? 0.1);

  match -= penaltyMissing;
  match -= penaltyExtra;

  if (expected.beverage) {
    if (served.beverage !== expected.beverage) {
      match -= 0.1;
    }
  } else if (served.beverage) {
    match -= 0.1;
  }

  return clamp(match, 0, 1);
}

function createTag(text) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = text;
  return tag;
}

class Game {
  constructor(level) {
    this.level = level;
    this.money = 0;
    this.combo = 0;
    this.served = 0;
    this.abandoned = 0;
    this.spawned = 0;
    this.goal = level.goal_money;
    this.tables = new Array(level.tables).fill(null);
    this.queue = [];
    this.customers = new Map();
    this.selectedCustomerId = null;
    this.currentOrder = {
      ingredients: RECIPES.base.slice(),
      beverage: null,
    };
    this.lastUpdate = performance.now();
    this.spawnInterval = level.timers.spawn_start;
    this.nextSpawn = level.timers.spawn_start;
    this.gameOver = false;

    this.setupUI();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupUI() {
    DOM.goal.textContent = this.goal;
    this.renderCurrentOrder();
    this.renderIngredientButtons();
    this.renderBeverageButtons();
    this.updateHUD();
    DOM.undo.addEventListener("click", () => this.undoIngredient());
    DOM.discard.addEventListener("click", () => this.resetOrder());
    DOM.serve.addEventListener("click", () => this.attemptServe());
  }

  renderIngredientButtons() {
    const allowed = new Set([
      ...Object.values(RECIPES.completos).flat(),
      ...RECIPES.extras,
    ]);
    DOM.ingredientButtons.innerHTML = "";
    const unique = Array.from(allowed).filter((item, index, arr) => arr.indexOf(item) === index);
    unique
      .sort()
      .forEach((ingredient) => {
        const btn = document.createElement("button");
        btn.textContent = formatIngredient(ingredient);
        btn.addEventListener("click", () => this.addIngredient(ingredient));
        DOM.ingredientButtons.appendChild(btn);
      });
  }

  renderBeverageButtons() {
    DOM.beverageButtons.innerHTML = "";
    RECIPES.bebidas.forEach((bev) => {
      const btn = document.createElement("button");
      btn.textContent = formatIngredient(bev);
      btn.addEventListener("click", () => this.toggleBeverage(bev));
      DOM.beverageButtons.appendChild(btn);
    });
  }

  addIngredient(ingredient) {
    this.currentOrder.ingredients.push(ingredient);
    this.renderCurrentOrder();
  }

  undoIngredient() {
    if (this.currentOrder.ingredients.length > RECIPES.base.length) {
      this.currentOrder.ingredients.pop();
      this.renderCurrentOrder();
    }
  }

  resetOrder() {
    this.currentOrder = {
      ingredients: RECIPES.base.slice(),
      beverage: null,
    };
    this.renderCurrentOrder();
  }

  toggleBeverage(beverage) {
    if (this.currentOrder.beverage === beverage) {
      this.currentOrder.beverage = null;
    } else {
      this.currentOrder.beverage = beverage;
    }
    this.renderCurrentOrder();
  }

  renderCurrentOrder() {
    DOM.currentOrder.innerHTML = "";
    this.currentOrder.ingredients.forEach((ingredient) => {
      DOM.currentOrder.appendChild(createTag(formatIngredient(ingredient)));
    });
    if (this.currentOrder.beverage) {
      DOM.currentOrder.appendChild(createTag(`Bebida ${formatIngredient(this.currentOrder.beverage)}`));
    }
  }

  attemptServe() {
    const served = {
      ingredients: this.currentOrder.ingredients.slice(),
      beverage: this.currentOrder.beverage,
    };

    let customer = null;
    let match = null;

    if (this.selectedCustomerId) {
      const selected = this.customers.get(this.selectedCustomerId);
      if (selected && selected.state === CUSTOMER_STATES.ORDERING) {
        customer = selected;
      } else {
        if (selected) {
          this.log("Ese cliente ya no puede recibir el pedido.");
        }
        this.selectedCustomerId = null;
      }
    }

    if (!customer) {
      const best = this.findBestCustomer(served);
      if (best && best.match > 0) {
        customer = best.customer;
        match = best.match;
        this.selectedCustomerId = customer.id;
        this.log(`Apuntando automáticamente a ${customer.name}.`);
      }
    }

    if (!customer) {
      this.log("No hay clientes listos para recibir ese pedido.");
      return;
    }

    const personality = PERSONALITIES[customer.personality];
    if (match == null) {
      match = computeMatch(served, customer.order, personality);
    }

    if (match <= 0) {
      this.log(`¡${customer.name} recibió cualquier cosa!`, "fail");
      this.penalizeCustomer(customer, 2);
      this.resetOrder();
      this.combo = 0;
      this.updateHUD();
      return;
    }

    const patienceBonus = customer.patience / customer.patienceMax;
    const comboMult = 1 + Math.min(this.combo * 0.05, 1);
    let payout = 10 * match * patienceBonus * comboMult;
    payout *= 1 + (personality.payoutBonus || 0);

    if (customer.order.beverage && customer.order.beverage === served.beverage) {
      payout *= 1.1;
    }

    payout = Math.round(payout * 10) / 10;
    this.money = Math.round((this.money + payout) * 10) / 10;
    this.combo += 1;
    this.served += 1;
    this.removeCustomer(customer, true);
    this.resetOrder();
    this.updateHUD();
    this.log(`Entregado a ${customer.name}: +$${payout.toFixed(1)} (match ${(match * 100).toFixed(0)}%)`, "success");
  }

  findBestCustomer(served) {
    let bestCustomer = null;
    let bestMatch = -Infinity;
    for (const customer of this.customers.values()) {
      if (customer.state !== CUSTOMER_STATES.ORDERING) continue;
      const personality = PERSONALITIES[customer.personality];
      const match = computeMatch(served, customer.order, personality);
      if (match > bestMatch) {
        bestMatch = match;
        bestCustomer = customer;
      }
    }
    if (!bestCustomer) {
      return null;
    }
    return { customer: bestCustomer, match: bestMatch };
  }

  penalizeCustomer(customer, amount = 1) {
    customer.patience = Math.max(0, customer.patience - amount);
    if (customer.patience <= 0) {
      this.makeAngry(customer);
    }
  }

  removeCustomer(customer, happy = false) {
    if (customer.tableIndex != null) {
      this.tables[customer.tableIndex] = null;
    }
    this.queue = this.queue.filter((id) => id !== customer.id);
    this.customers.delete(customer.id);
    if (this.selectedCustomerId === customer.id) {
      this.selectedCustomerId = null;
    }
    if (!happy) {
      this.combo = 0;
      this.abandoned += 1;
      this.log(`${customer.name} se fue enojado.`, "fail");
    }
    this.updateHUD();
  }

  makeAngry(customer) {
    customer.state = CUSTOMER_STATES.ANGRY;
    this.removeCustomer(customer, false);
  }

  spawnCustomer() {
    if (this.spawned >= this.level.customers) {
      return;
    }
    const totalActive = this.customers.size;
    if (totalActive >= this.level.tables + this.level.queue_slots) {
      return; // espera
    }

    const order = createOrder(this.level);
    const personality = pickRandom(PERSONALITY_POOL);
    const config = PERSONALITIES[personality];
    const patienceMax = this.level.timers.patience * config.patienceMultiplier;

    const customer = {
      id: `c${customerId++}`,
      name: pickRandom(NAMES),
      state: CUSTOMER_STATES.QUEUE,
      order,
      patience: patienceMax,
      patienceMax,
      personality,
      tableIndex: null,
      queueEntered: performance.now(),
    };

    this.spawned += 1;

    if (this.hasFreeTable()) {
      this.seatCustomer(customer);
    } else {
      this.queue.push(customer.id);
      this.customers.set(customer.id, customer);
    }
    this.updateSpawnInterval();
  }

  hasFreeTable() {
    return this.tables.some((slot) => slot === null);
  }

  seatCustomer(customer) {
    const index = this.tables.findIndex((slot) => slot === null);
    if (index === -1) {
      return;
    }
    customer.state = CUSTOMER_STATES.ORDERING;
    customer.tableIndex = index;
    this.tables[index] = customer.id;
    this.customers.set(customer.id, customer);
    this.log(`${customer.name} pide un ${customer.order.type}.`);
  }

  tickQueues() {
    if (!this.hasFreeTable() || this.queue.length === 0) {
      return;
    }
    const id = this.queue.shift();
    const customer = this.customers.get(id);
    if (customer) {
      this.seatCustomer(customer);
    }
  }

  updateHUD() {
    DOM.money.textContent = this.money.toFixed(1);
    DOM.combo.textContent = `${(1 + Math.min(this.combo * 0.05, 1)).toFixed(2)}×`;
    DOM.served.textContent = this.served;
  }

  loop(now) {
    if (this.gameOver) {
      return;
    }

    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      this.spawnCustomer();
      this.nextSpawn = this.spawnInterval;
    }

    this.tickQueues();
    this.updateCustomers(dt);
    this.render();

    if (this.served + this.abandoned >= this.level.customers && this.customers.size === 0) {
      this.gameOver = true;
      this.log(`Jornada terminada. Dinero final: $${this.money.toFixed(1)}.`);
    } else {
      requestAnimationFrame(this.loop);
    }
  }

  updateSpawnInterval() {
    const progress = clamp(this.spawned / this.level.customers, 0, 1);
    const start = this.level.timers.spawn_start;
    const end = this.level.timers.spawn_end;
    this.spawnInterval = start + (end - start) * progress;
  }

  updateCustomers(dt) {
    const crowdPressure = clamp((this.queue.length - 2) * 0.05, 0, 0.5);
    for (const customer of this.customers.values()) {
      const personality = PERSONALITIES[customer.personality];
      if (customer.state === CUSTOMER_STATES.ORDERING) {
        const decay = dt * (1 + crowdPressure) * personality.decayMultiplier;
        customer.patience -= decay;
        if (customer.patience <= 0) {
          this.makeAngry(customer);
        }
      } else if (customer.state === CUSTOMER_STATES.QUEUE) {
        const decay = dt * 0.5 * (1 + crowdPressure);
        customer.patience -= decay;
        if (customer.patience <= 0) {
          this.makeAngry(customer);
        }
      }
    }
  }

  render() {
    this.renderCustomers();
  }

  renderCustomers() {
    DOM.tables.innerHTML = "";
    this.tables.forEach((customerId, index) => {
      const container = document.createElement("div");
      container.className = "table-slot";
      const title = document.createElement("h3");
      title.textContent = `Mesa ${index + 1}`;
      container.appendChild(title);
      if (customerId) {
        const customer = this.customers.get(customerId);
        if (customer) {
          container.appendChild(this.createCustomerElement(customer));
        }
      } else {
        const empty = document.createElement("p");
        empty.textContent = "Disponible";
        empty.className = "empty";
        container.appendChild(empty);
      }
      DOM.tables.appendChild(container);
    });

    DOM.queue.innerHTML = "";
    this.queue.forEach((customerId, position) => {
      const customer = this.customers.get(customerId);
      if (!customer) return;
      const element = this.createCustomerElement(customer);
      element.classList.add("queue-customer");
      const pos = document.createElement("div");
      pos.className = "queue-position";
      pos.textContent = `Posición ${position + 1}`;
      element.prepend(pos);
      DOM.queue.appendChild(element);
    });
  }

  createCustomerElement(customer) {
    const element = DOM.template.content.firstElementChild.cloneNode(true);
    const info = element.querySelector(".customer__name");
    const state = element.querySelector(".customer__state");
    const order = element.querySelector(".customer__order");
    const patience = element.querySelector(".bar__fill");

    info.textContent = `${customer.name} (${PERSONALITIES[customer.personality].label})`;
    order.textContent = formatOrder(customer.order);

    let stateLabel = "";
    switch (customer.state) {
      case CUSTOMER_STATES.ORDERING:
        stateLabel = "Esperando";
        break;
      case CUSTOMER_STATES.QUEUE:
        stateLabel = "En fila";
        break;
      case CUSTOMER_STATES.ANGRY:
        stateLabel = "Enojado";
        element.classList.add("customer--angry");
        break;
      default:
        stateLabel = customer.state;
    }
    state.textContent = stateLabel;
    const pct = clamp(customer.patience / customer.patienceMax, 0, 1) * 100;
    patience.style.width = `${pct}%`;

    if (this.selectedCustomerId === customer.id) {
      element.classList.add("customer--selected");
    }

    element.addEventListener("click", () => {
      if (customer.state !== CUSTOMER_STATES.ORDERING) {
        this.log("Ese cliente aún no puede recibir el pedido.");
        return;
      }
      this.selectedCustomerId = customer.id;
      this.renderCustomers();
    });

    return element;
  }

  log(message, type = "info") {
    const entry = document.createElement("li");
    entry.className = `log__entry${type === "success" ? " log__entry--success" : ""}${
      type === "fail" ? " log__entry--fail" : ""
    }`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    DOM.log.prepend(entry);
  }
}

function startGame() {
  const level = LEVELS[0];
  new Game(level);
}

startGame();
