# Completos Rush Web Edition — GDD v2 (sin Unity)

> Versión ampliada y pensada para web (HTML5) sin dependencias de motores pesados. Foco en jugabilidad, mantenibilidad, escalabilidad y performance en navegadores desktop y mobile.

---

## 0) Resumen Ejecutivo

**Género:** Time-management / casual.  
**Plataformas:** Web (Desktop + Mobile, responsive).  
**Stack sugerido:** React + Zustand (estado) + Canvas (PixiJS **o** Phaser 3 para capa de render/inputs), Vite para bundling.  
**Inspiración:** Overcooked, Papa’s Hot Doggeria, Diner Dash, pero con identidad talquina.  
**Elevator pitch:** Atiende un carrito de completos talquino. Arma pedidos correctos bajo presión, mantén combos y alcanza la meta del día antes de que la clientela pierda la paciencia.

---

## 1) Visión & Principios de Diseño

1. **Aprender en 10s, dominar en horas:** interacción de un toque/clic, reglas claras, dificultad por ritmo y encolamiento cognitivo.
2. **Chile-first:** lenguaje, humor, estética y recetas locales (italiano, dinámico, chacarero).
3. **Ritmo-respuesta:** la diversión surge de la *core loop*: leer pedido → ensamblar → entregar → recompensa (dinero/propina/combo) → nuevo pedido.
4. **Configurabilidad total:** reglas, recetas, niveles y economía definidas en JSON para iterar sin tocar código.
5. **Builds livianos:** 60 FPS objetivo, assets optimizados, input sin lag.

---

## 2) Core Loop

1. **Spawn cliente** con paciencia y distribución de pedidos.
2. **Cliente muestra burbuja** con su pedido.
3. **Jugador arma completo** (pan+salchicha+toppings) y opcionalmente bebida.
4. **Entrega** por clic en cliente o drag&drop a la mesa/cliente.
5. **Scoring** (match, paciencia, combo).
6. **Salida** del cliente (feliz o enojado).
7. **Chequeo de meta** y fin de jornada.

---

## 3) Mecánicas Detalladas

### 3.1 Ensamblaje

* **Base obligatoria:** `pan` + `salchicha`.
* **Toppings válidos por receta:** `palta`, `tomate`, `mayo`, `americana`, `salsa_verde`, `aji`, `chucrut`, `queso` (extensibles).
* **Bebida:** `lata | cola | limon | naranja` (opcional por cliente, 70% de prob. configurable).
* **Ergonomía UI:** 1 toque por ingrediente. Undo (1 paso) y botón *Descartar*.

### 3.2 Entrega

* **Click-entrega:** con pedido válido y cliente en estado `Ordering`.
* **Drag-entrega:** arrastrar icono de pedido hacia el cliente (snap hitbox).
* Si mesa incorrecta: feedback rojo + vibración (mobile) + no consume el pedido.

### 3.3 Paciencia

* Rango por nivel (ej: 18–30 s).
* Decaimiento lineal por defecto, con *spikes* si la cola supera X clientes (presión social).
* Clientes especiales (ansiosos) tienen multiplicador de decaimiento.

### 3.4 Scoring

* **Base:** 10 monedas por perfecto.
* **MatchQuality:** –10% por ingrediente faltante o extra. –10% por bebida incorrecta (o presente cuando no corresponde).
* **Patience bonus:** multiplica por (patience_remaining / patience_max).
* **Combo:** +1 por perfecto consecutivo, aplica multiplicador al ingreso (p.ej., 1.0 + 0.05×streak, cap 2.0).
* **Propina:** +10–20% si bebida correcta o si se entrega antes de un umbral (p.ej., >70% paciencia).

### 3.5 Fallas y Castigos

* Cliente se va enojado → +1 *abandoned*, resetea combo.
* Entrega con mesa equivocada → no se consume pedido, -1 s de paciencia del cliente por frustración.

---

## 4) Sistema de Clientes (IA liviana)

**Estados:** `Arriving → Waiting → Seated → Ordering → Eating → Leaving | AngryLeaving`  
**Patrones de orden:** distribuciones ponderadas por nivel (p.ej., {"italiano": 0.8, "dinamico": 0.2}).  
**Personalidades:**

* *Tranquilo:* paciencia +20%.
* *Apuros:* paciencia –25%, paga +10% si perfecto.
* *Exigente:* penaliza más fuerte ingredientes extra (–15% por extra).

**Asignación de mesa/cola:** slots limitados, si cola llena retrasa spawn.  
**SpawnRate dinámico:** Lerp 7s→5s a medida que avanza el nivel.

---

## 5) Progression & Dificultad

* **Curva**: +clientes, –paciencia, +variantes de recetas, +ruido (clientes especiales).
* **Metas por nivel:** dinero objetivo creciente.
* **Desbloqueos:** nuevos toppings/bebidas; skins del carrito (cosméticos).
* **Modos futuros:** Modo Infinito, Desafíos Diarios, Historia Local (NPCs icónicos).

---

## 6) Contenido (MVP)

### 6.1 Recetas

* **Italiano:** palta, tomate, mayo.
* **Dinámico:** tomate, americana, mayo, salsa_verde.
* **Chacarero (M2):** poroto_verde, aji, tomate, mayo.

### 6.2 Niveles (MVP)

| Nivel | Meta $ | Tablas | Cola | Clientes | Patience | Mix |
| ----: | -----: | -----: | ---: | -------: | -------: | -------------------------------: |
| 1-1 | 100 | 4 | 3 | 12 | 18s | 80%/20% (Ital/Din) |
| 1-2 | 150 | 4 | 3 | 14 | 16s | 65%/35% |
| 1-3 | 200 | 5 | 4 | 16 | 14s | 55%/45% + 10% chacarero (solapa) |

---

## 7) UX/UI

**Layout:**

* **Top bar:** Dinero, Meta, Timer, Combo.
* **Centro:** Mesas + clientes (Canvas).
* **Bottom:** Estaciones (botonera ingredientes), zona de ensamblaje (chips de ingredientes + mini-preview).
* **Burbujas:** pedido del cliente con iconos (orden no importa visualmente pero se lista completo).
* **Feedback:**

  * Correcto: destello verde + SFX monedas.
  * Incorrecto: shake + rojo + SFX trombón bajito.
  * Casi: amarillo, texto “faltó *palta*”.
* **Accesibilidad:**

  * Modo alto contraste, color-blind safe (no codificar por color únicamente).
  * Tamaños táctiles ≥ 44px.
  * Toggle de texto en burbujas (“Italiano”) además de iconos.

---

## 8) Economía del Juego (MVP)

* **Ingreso base por pedido perfecto:** 10.
* **Propina bebida correcta:** +10%.
* **Combo multiplier:** +5% por perfecto consecutivo (cap 2×).
* **Penalizaciones:** –10% por ingrediente extra o faltante; –10% bebida mal.

**Balance objetivo (1-1):**

* Tasa de perfectos esperada 55–70%.
* Abandonos < 3.
* Tiempo medio por pedido ~8–10 s.

---

## 9) Datos & Configuración (JSON-first)

### 9.1 recipes.json

```json
{
  "base": ["pan", "salchicha"],
  "completos": {
    "italiano": ["palta", "tomate", "mayo"],
    "dinamico": ["tomate", "americana", "mayo", "salsa_verde"],
    "chacarero": ["poroto_verde", "aji", "tomate", "mayo"]
  },
  "extras": ["queso", "chucrut", "ketchup", "mostaza", "aji", "salsa_verde"],
  "bebidas": ["lata", "cola", "limon", "naranja"],
  "opciones": {"hielo": true}
}
```

### 9.2 levels.json

```json
{
  "levels": [
    {
      "world": 1,
      "level": 1,
      "goal_money": 100,
      "tables": 4,
      "queue_slots": 3,
      "customers": 12,
      "order_mix": {"italiano": 0.8, "dinamico": 0.2},
      "timers": {"patience": 18, "prep_pan": 0.3, "prep_sausage": 0.5},
      "beverages_enabled": true,
      "toppings_enabled": ["palta", "tomate", "mayo", "americana", "salsa_verde"]
    }
  ]
}
```

### 9.3 save.json (localStorage)

```json
{
  "progress": {"world": 1, "level": 2},
  "stats": {
    "money_total": 1240,
    "perfect_orders": 93,
    "orders_total": 145,
    "max_combo": 8,
    "abandoned": 11
  },
  "settings": {"audio": 0.8, "contrast": "high", "lang": "es-CL"}
}
```

---

## 10) Lógica & Algoritmos

### 10.1 Patience decay (por frame)

```
patience -= dt * base_decay * (1 + crowd_pressure) * personality_mult
crowd_pressure = clamp((queue_length - queue_softcap) * 0.05, 0, 0.5)
personality_mult = 0.75 (tranquilo) | 1.0 (normal) | 1.25 (apuros)
```

### 10.2 Selección de tipo de completo

```
r = random(0,1); acc=0
for (tipo, peso) in order_mix_norm:
  acc += peso
  if r <= acc: return tipo
```

Normalizar `order_mix` si la suma != 1.0.

### 10.3 MatchQuality

```
match = 1.0
for ing in expected: if ing not in served: match -= 0.1
for ing in served: if ing not in expected: match -= 0.1
if expected.bebida:
  if served.bebida != expected.bebida: match -= 0.1
else:
  if served.bebida: match -= 0.1
match = clamp(match, 0, 1)
```

### 10.4 Scoring final

```
base = 10
patience_bonus = patience / patience_max
combo_mult = 1.0 + min(combo_streak * 0.05, 1.0)
value = base * match * patience_bonus * combo_mult
```

---

## 11) Arquitectura Técnica (Web)

### 11.1 Opciones

* **Opción A (UI + Canvas):** React (UI/HUD/menús) + PixiJS/Phaser (Canvas para escena y animaciones).
* **Opción B (Canvas only):** Phaser 3 para todo (UI ligera con DOM overlay).  
  **Recomendación MVP:** Opción A para separar responsabilidades (React para HUD + lógica, Phaser para escena / inputs táctiles fluidos).

### 11.2 Component Tree (Opción A)

* `<GameRoot>`

  * `<HUD />` (dinero, meta, timer, combo, pausa)
  * `<StationTray />` (botones de ingredientes, undo, descartar)
  * `<OrderPreview />`
  * `<SceneCanvas />` (Phaser/Pixi: mesas, clientes, burbujas, arrastres)
  * `<Modals />` (pausa, fin de nivel, tutorial)

**Estado global:** Zustand/Redux  
`game: { paused, money, combo, stats }`  
`level: { config, timers, spawnState }`  
`order: { ingredients[], beverage }`  
`customers: { list[] }`

### 11.3 Comunicación React ↔ Canvas

* **Events bus** (tiny emitter): `ORDER_UPDATED`, `DELIVER_ATTEMPT({customerId})`, `CUSTOMER_SPAWNED`, `CUSTOMER_LEFT`, `LEVEL_COMPLETE`.
* **Selectors** para suscripción eficiente (evitar rerenders globables).

### 11.4 Input

* Soporte **pointer events** unificados (mouse/touch).
* Zonas de drop con `hitTest`.
* Gestos simples (drag start/snap/reject).

### 11.5 Performance

* Spritesheets (TexturePacker), atlas por temática.
* Lazy load de assets por mundo.
* Pool de clientes y burbujas.
* Actualizar barras de paciencia con `requestAnimationFrame` sincronizado a Canvas; HUD cada 100–200 ms para ahorro.

---

## 12) Contenido Visual & Audio

* **Sprites clientes:** 6 variantes (MVP), capas para color de polera/accesorios.
* **Ingredientes:** iconografía clara y reconocible; paleta color-blind safe.
* **SFX:** click ingrediente, chisporroteo plancha, moneda, error (trombone).
* **Música:** loop ~90–105 BPM estilo cumbia/chill.

---

## 13) Accesibilidad & Localización

* Texto alternativo en burbujas (nombre del completo).
* UI escalable (slider de tamaño).
* ES-CL por defecto; archivo `i18n.json` preparado para EN/ES-LATAM.

---

## 14) Telemetría & KPIs (opt-in)

* **KPIs:** tasa de perfectos, avg combo, abandonos por nivel, tiempo medio por pedido, funil de tutorial (drop-offs).
* **Eventos:** `start_level`, `deliver{perfect|imperfect}`, `abandon`, `pause`, `finish_level{win|lose}`.
* **Herramienta:** Posthog/Umami (self-host) o GA4 (si se prioriza simple).

---

## 15) QA & Pruebas

### 15.1 Plan funcional (MVP)

1. Preparar 10 italianos válidos.
2. Forzar un pedido con extra y verificar penalización.
3. Dejar expirar paciencia de 1 cliente → abandono contabilizado.
4. Entregar con mesa incorrecta → feedback y no consume pedido.
5. Fin de nivel: guarda `save.json` y muestra resumen.

### 15.2 Compatibilidad

* Chrome, Safari, Firefox (2 últimas versiones), iOS Safari, Android Chrome.
* 30–60 FPS en móviles medios.

---

## 16) Roadmap de Implementación (4 semanas sugeridas)

**Semana 1:** Fundaciones

* Vite + React + Zustand + Phaser.
* Carga de `recipes.json` y `levels.json`.
* Render de escena base + HUD estático.
* Modelo `Order` y `MatchQuality`.

**Semana 2:** Jugabilidad núcleo

* Spawner de clientes + IA simple de estados.
* Barra de paciencia + entrega por clic.
* Scoring + combo + meta.
* Guardado local.

**Semana 3:** UX y Polish

* Drag&drop, feedbacks (SFX/VFX), tutorial guiado.
* Accesibilidad (alto contraste, tamaños).
* Balances 1-1, 1-2, 1-3.

**Semana 4:** Performance & QA

* Pooling, spritesheet, telemetría, QA cross-browser.
* Pulir responsive y toques finales de arte/música.

---

## 17) Riesgos & Mitigaciones

* **Lag en móviles:** texturas pesadas → usar atlas + compresión + pool.
* **Confusión visual:** redundar icono + texto de receta.
* **Balance:** usar toggles de dificultad y A/B con telemetría.

---

## 18) Especificaciones de Datos (TS opcional)

```ts
// Order
interface OrderDTO {
  ingredients: string[]; // incluye pan y salchicha
  beverage?: string | null;
  tableId?: number | null;
}

// Customer
interface CustomerDTO {
  id: string;
  state: 'Arriving'|'Waiting'|'Seated'|'Ordering'|'Eating'|'Leaving'|'AngryLeaving';
  patienceMax: number;
  patience: number;
  tableIndex: number | null;
  orderExpected: OrderDTO;
  personality: 'calm'|'normal'|'rushy'|'picky';
}

// Level
interface LevelConfig {
  world: number; level: number;
  goal_money: number; tables: number; queue_slots: number; customers: number;
  order_mix: Record<string, number>;
  timers: { patience: number; prep_pan?: number; prep_sausage?: number };
  beverages_enabled: boolean;
  toppings_enabled: string[];
}
```

---

## 19) Pseudocódigo de Estados (Cliente)

```
switch(state):
  Arriving: moveTo(queueSpot); if (atSpot) state=Waiting
  Waiting: if (mesaLibre) {asignarMesa(); state=Seated}
  Seated: delay(1s) → state=Ordering; mostrarBurbuja()
  Ordering:
    patience -= decay(dt)
    if (deliver && match>=0.7) { state=Eating; payout(); }
    if (patience<=0) state=AngryLeaving
  Eating: delay(3–5s) → state=Leaving
  Leaving|AngryLeaving: moveTo(exit); destroy()
```

---

## 20) Contenido Cultural (tono/diálogos)

* Burbujas: “Un italiano sin mayo, porfa”, “¿Con bebida de limón?”.
* Frases ambiente: “¡La mayo casera!”, “¡La palta está filete!”.
* Personajes célebres locales en M2 como skins/eventos (no MVP).

---

## 21) Criterios de Éxito (MVP)

* Core loop estable y divertido en 1-1.
* 60%+ de jugadores completan 1-1 en <5 intentos.
* 30 min de sesión media sin fatiga (modo infinito no requerido en MVP).

---

## 22) Anexos

* **Wireframes** (texto):

  * *Home:* Logo, Jugar, Configuración, Créditos.
  * *HUD In-game:* barra superior (dinero/meta/timer/combo), centro (mesas y clientes), inferior (estaciones + preview).
  * *Resumen:* dinero total, % perfectos, abandonos, combo máx, botón Reintentar/Siguiente.
* **Checklist de Assets:**

  * Clientes (6 variantes), ingredientes (12 iconos), mesas (2), carrito (1), burbuja (1), barras (2), botones (10).
* **Tabla de SFX:** click, success, fail, coin, fry, ui-blip.

---

### Conclusión

Este GDD v2 prioriza claridad, configuración por datos, performance en web y una identidad chilena amable y divertida. El MVP es deliberadamente acotado para lograr un *time-to-fun* inmediato y una base sólida para crecer (historias, modos y cosméticos) sin rehacer la arquitectura.
