// Everything the museum hall paints with plain 2D canvas drawing.
// There are no image files: the plaster, floor, ceiling and the blurred
// treasures are all drawn here. Change a colour or a size and refresh.

type Ctx = CanvasRenderingContext2D;

// ---------- Dials: the easy things to change ----------

export const HALL = {
  radius: 12, // how wide the room is (metres)
  height: 7.5,
  floorY: -0.12, // matches the floor in ObjectScene
  alcoves: 14, // arched niches around the wall
  lowPowerAlcoves: 8, // on phones and weaker laptops
  postRadius: 10.6, // the brass-wrapped posts
} as const;

export const PALETTE = {
  brass: "#b98a4a",
  brassLight: "#d6a45f",
  brassDark: "#7d5629",
  ochre: "#a66a3f",
  indigo: "#10182e",
  ivory: "#e9dcc0",
} as const;

// ---------- Helpers ----------

// A small, repeatable random number generator, so the walls look the same every time.
export function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function brassGradient(ctx: Ctx, top: number, bottom: number) {
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, PALETTE.brassLight);
  gradient.addColorStop(0.5, PALETTE.brass);
  gradient.addColorStop(1, PALETTE.brassDark);
  return gradient;
}

// A small brass plaque, like the ones that covered the pillars of the Benin palace.
function plaque(ctx: Ctx, x: number, y: number, w: number, h: number, variant: number) {
  ctx.fillStyle = brassGradient(ctx, y + h, y);
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#3b2512";
  ctx.fillRect(x + 0.05, y + 0.05, w - 0.1, h - 0.1);

  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.fillStyle = "#a97b3f";
  ctx.beginPath();
  if (variant === 0) {
    ctx.arc(cx, cy, 0.15, 0, Math.PI * 2);
  } else if (variant === 1) {
    ctx.moveTo(cx, cy + 0.2);
    ctx.lineTo(cx + 0.14, cy);
    ctx.lineTo(cx, cy - 0.2);
    ctx.lineTo(cx - 0.14, cy);
    ctx.closePath();
  } else {
    ctx.rect(cx - 0.14, cy + 0.06, 0.28, 0.1);
    ctx.rect(cx - 0.14, cy - 0.16, 0.28, 0.1);
  }
  ctx.fill();
}

// ---------- The wall: red-earth plaster, a wooden dado, a frieze of brass plaques ----------

export function paintWall(ctx: Ctx, w: number, h: number, alcoveCount: number) {
  const circumference = 2 * Math.PI * HALL.radius;

  ctx.save();
  // From here on we draw in metres, with "up" being up.
  ctx.setTransform(w / circumference, 0, 0, -h / HALL.height, 0, h);

  const plaster = ctx.createLinearGradient(0, 0, 0, HALL.height);
  plaster.addColorStop(0, "#1f100a");
  plaster.addColorStop(0.2, "#4a2619");
  plaster.addColorStop(0.55, "#7a4331");
  plaster.addColorStop(0.88, "#5a2f20");
  plaster.addColorStop(1, "#2a140d");
  ctx.fillStyle = plaster;
  ctx.fillRect(0, 0, circumference, HALL.height);

  // Soft patches, so the plaster doesn't look flat
  const random = rng(7);
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = random() > 0.5 ? "rgba(255,200,150,0.035)" : "rgba(0,0,0,0.07)";
    ctx.beginPath();
    ctx.ellipse(
      random() * circumference,
      random() * HALL.height,
      0.2 + random() * 0.8,
      0.15 + random() * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Wooden dado along the bottom
  ctx.fillStyle = "#22140c";
  ctx.fillRect(0, 0, circumference, 1.15);
  for (let x = 0; x < circumference; x += 0.4) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x, 0, 0.015, 1.15);
    ctx.fillStyle = "rgba(255,200,140,0.06)";
    ctx.fillRect(x + 0.02, 0, 0.01, 1.15);
  }
  ctx.fillStyle = PALETTE.brassDark;
  ctx.fillRect(0, 1.12, circumference, 0.07);
  ctx.fillStyle = PALETTE.brassLight;
  ctx.fillRect(0, 1.17, circumference, 0.015);

  // A pilaster in the pier between each pair of alcoves
  const spacing = circumference / alcoveCount;
  for (let i = 0; i < alcoveCount; i++) {
    const x = (i + 0.5) * spacing;
    ctx.fillStyle = "rgba(255,205,150,0.07)";
    ctx.fillRect(x - 0.45, 1.2, 0.9, 3.65);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - 0.45, 1.2, 0.05, 3.65);
    ctx.fillRect(x + 0.4, 1.2, 0.05, 3.65);
  }

  // The frieze of brass plaques above the alcoves
  ctx.fillStyle = "#1b0e08";
  ctx.fillRect(0, 4.9, circumference, 0.85);
  ctx.fillStyle = PALETTE.brass;
  ctx.fillRect(0, 5.75, circumference, 0.05);
  ctx.fillRect(0, 4.85, circumference, 0.05);

  let index = 0;
  for (let x = 0.05; x < circumference; x += 0.57) {
    plaque(ctx, x, 4.99, 0.5, 0.66, index % 3);
    index += 1;
  }

  // Cornice under the ceiling
  ctx.fillStyle = "#170b07";
  ctx.fillRect(0, 6.8, circumference, 0.7);
  ctx.fillStyle = PALETTE.ochre;
  ctx.fillRect(0, 6.78, circumference, 0.04);

  ctx.restore();
}

// ---------- The floor: dark stone with inlaid rings and geometric bands ----------

function ring(ctx: Ctx, inner: number, outer: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, outer, 0, Math.PI * 2);
  ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

export function paintFloor(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = "#17110d";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.setTransform(w / (2 * HALL.radius), 0, 0, h / (2 * HALL.radius), w / 2, h / 2);

  // Faint stone joints, radiating from the centre
  ctx.strokeStyle = "rgba(255,220,170,0.05)";
  ctx.lineWidth = 0.02;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 2.6, Math.sin(angle) * 2.6);
    ctx.lineTo(Math.cos(angle) * HALL.radius, Math.sin(angle) * HALL.radius);
    ctx.stroke();
  }

  // Inner indigo band with diamonds
  ring(ctx, 3.7, 4.5, PALETTE.indigo);
  for (let i = 0; i < 40; i++) {
    ctx.save();
    ctx.rotate((i / 40) * Math.PI * 2);
    ctx.translate(4.1, 0);
    ctx.fillStyle = i % 2 === 0 ? PALETTE.ochre : "rgba(233,220,192,0.7)";
    ctx.beginPath();
    ctx.moveTo(0, -0.3);
    ctx.lineTo(0.2, 0);
    ctx.lineTo(0, 0.3);
    ctx.lineTo(-0.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Middle band with a zigzag, inspired by woven and dyed cloth
  ring(ctx, 6.0, 6.9, "#1b130d");
  for (let i = 0; i < 64; i++) {
    const a0 = (i / 64) * Math.PI * 2;
    const a1 = ((i + 1) / 64) * Math.PI * 2;
    const aMid = (a0 + a1) / 2;
    ctx.fillStyle = i % 2 === 0 ? "rgba(233,220,192,0.55)" : PALETTE.ochre;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * 6.05, Math.sin(a0) * 6.05);
    ctx.lineTo(Math.cos(aMid) * 6.85, Math.sin(aMid) * 6.85);
    ctx.lineTo(Math.cos(a1) * 6.05, Math.sin(a1) * 6.05);
    ctx.closePath();
    ctx.fill();
  }

  // Outer ochre rim
  ring(ctx, 9.0, 9.5, "#5a3a22");

  // Thin brass inlay lines between the bands
  for (const [inner, outer] of [
    [2.4, 2.46],
    [3.62, 3.68],
    [4.52, 4.58],
    [5.94, 6.0],
    [6.9, 6.96],
    [8.95, 9.0],
    [9.5, 9.56],
    [10.5, 10.56],
  ]) {
    ring(ctx, inner, outer, PALETTE.brass);
  }

  ctx.restore();
}

// ---------- The ceiling: dark timber beams around a glowing round skylight ----------

export function paintCeiling(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = "#150b07";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.setTransform(w / (2 * HALL.radius), 0, 0, h / (2 * HALL.radius), w / 2, h / 2);

  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((i / 16) * Math.PI * 2);
    ctx.fillStyle = "#2b170e";
    ctx.fillRect(1.6, -0.22, 10.4, 0.44);
    ctx.fillStyle = "rgba(196,145,79,0.35)";
    ctx.fillRect(1.6, -0.22, 10.4, 0.04);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(196,145,79,0.6)";
  ctx.lineWidth = 0.06;
  for (const radius of [1.5, 5.2, 9.4]) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  const light = ctx.createRadialGradient(0, 0, 0, 0, 0, 2.2);
  light.addColorStop(0, "rgba(255,226,170,0.9)");
  light.addColorStop(0.5, "rgba(255,200,130,0.35)");
  light.addColorStop(1, "rgba(255,180,100,0)");
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------- The brass-wrapped posts (one square module, repeated) ----------

export function paintPost(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = "#24160d";
  ctx.fillRect(0, 0, w, h);

  const margin = w * 0.07;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, PALETTE.brassLight);
  gradient.addColorStop(0.5, PALETTE.brass);
  gradient.addColorStop(1, PALETTE.brassDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(margin, margin, w - margin * 2, h - margin * 2);

  ctx.fillStyle = "#3b2512";
  ctx.fillRect(margin * 2, margin * 2, w - margin * 4, h - margin * 4);

  ctx.fillStyle = "#a97b3f";
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.38, w * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w * 0.32, h * 0.6, w * 0.36, h * 0.07);
  ctx.fillRect(w * 0.32, h * 0.72, w * 0.36, h * 0.07);
}

// ---------- The niche, the glow and the light pools ----------

// An arched alcove: dark inside, lit from below, with a brass frame.
export function paintPlate(ctx: Ctx, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const radius = w / 2 - 20;
  const archCentre = radius + 24;

  ctx.beginPath();
  ctx.moveTo(20, h - 8);
  ctx.lineTo(20, archCentre);
  ctx.arc(cx, archCentre, radius, Math.PI, 0);
  ctx.lineTo(w - 20, h - 8);
  ctx.closePath();

  const inside = ctx.createLinearGradient(0, 0, 0, h);
  inside.addColorStop(0, "#080403");
  inside.addColorStop(0.6, "#1d0f09");
  inside.addColorStop(1, "#3a1d10");
  ctx.fillStyle = inside;
  ctx.fill();

  const warm = ctx.createRadialGradient(cx, h * 0.78, 10, cx, h * 0.78, w * 0.62);
  warm.addColorStop(0, "rgba(255,190,110,0.38)");
  warm.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = warm;
  ctx.fill();

  ctx.lineWidth = 14;
  ctx.strokeStyle = PALETTE.brass;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,225,170,0.45)";
  ctx.stroke();

  // The little pedestal the object stands on
  ctx.fillStyle = "#150b07";
  ctx.fillRect(cx - 110, h * 0.86, 220, h * 0.1);
  ctx.fillStyle = PALETTE.brass;
  ctx.fillRect(cx - 110, h * 0.86, 220, 4);
}

export function paintGlow(ctx: Ctx, w: number, h: number) {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

// ---------- The blurred treasures ----------
// Each one is a simple silhouette, drawn out of focus. A blurred shape is
// made by drawing it off the edge of the canvas and keeping only its shadow.

export interface SpriteSpec {
  name: string;
  color: string;
  draw: (ctx: Ctx) => void;
  detail?: (ctx: Ctx) => void;
}

const circle = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const oval = (ctx: Ctx, x: number, y: number, rx: number, ry: number) => {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};

export const SPRITES: SpriteSpec[] = [
  {
    // Sango's oshe: a staff topped with a double-headed axe. Shown as an object only.
    name: "Oshe staff of Sango",
    color: "#c98f4f",
    draw: (ctx) => {
      ctx.fillRect(122, 150, 12, 200);
      oval(ctx, 128, 352, 26, 8);
      circle(ctx, 128, 100, 9);
      ctx.beginPath();
      ctx.moveTo(128, 112);
      ctx.bezierCurveTo(80, 60, 40, 70, 34, 118);
      ctx.bezierCurveTo(60, 150, 100, 150, 128, 138);
      ctx.bezierCurveTo(156, 150, 196, 150, 222, 118);
      ctx.bezierCurveTo(216, 70, 176, 60, 128, 112);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    name: "Ife head",
    color: "#b5714a",
    draw: (ctx) => {
      oval(ctx, 128, 170, 58, 80);
      ctx.fillRect(104, 235, 48, 70);
      ctx.fillRect(84, 300, 88, 48);
      oval(ctx, 128, 100, 52, 16);
    },
  },
  {
    name: "Nok terracotta head",
    color: "#b5654a",
    draw: (ctx) => {
      oval(ctx, 128, 190, 56, 72);
      circle(ctx, 90, 112, 20);
      circle(ctx, 128, 100, 22);
      circle(ctx, 166, 112, 20);
      ctx.fillRect(108, 250, 40, 60);
      ctx.fillRect(88, 305, 80, 45);
    },
  },
  {
    name: "Igbo-Ukwu pot",
    color: "#a8793f",
    draw: (ctx) => {
      circle(ctx, 128, 250, 86);
      ctx.fillRect(98, 140, 60, 60);
      oval(ctx, 128, 140, 46, 12);
      oval(ctx, 128, 336, 60, 10);
    },
  },
  {
    name: "Ibeji twin figures",
    color: "#b5714a",
    draw: (ctx) => {
      for (const x of [84, 172]) {
        circle(ctx, x, 130, 24);
        ctx.beginPath();
        ctx.moveTo(x - 30, 170);
        ctx.lineTo(x + 30, 170);
        ctx.lineTo(x + 22, 330);
        ctx.lineTo(x - 22, 330);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(x - 26, 328, 52, 20);
      }
    },
  },
  {
    name: "Benin plaque",
    color: "#c4914f",
    draw: (ctx) => {
      ctx.fillRect(48, 90, 160, 230);
      ctx.fillRect(100, 78, 56, 16);
    },
    detail: (ctx) => {
      circle(ctx, 128, 160, 20);
      ctx.beginPath();
      ctx.moveTo(100, 280);
      ctx.lineTo(156, 280);
      ctx.lineTo(146, 184);
      ctx.lineTo(110, 184);
      ctx.closePath();
      ctx.fill();
    },
  },
  {
    name: "Ivory tusk",
    color: "#e0d0aa",
    draw: (ctx) => {
      ctx.lineWidth = 34;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(70, 340);
      ctx.bezierCurveTo(60, 200, 120, 110, 200, 120);
      ctx.stroke();
    },
  },
  {
    name: "Gelede mask",
    color: "#b5714a",
    draw: (ctx) => {
      oval(ctx, 128, 230, 60, 80);
      ctx.fillRect(112, 100, 32, 70);
      circle(ctx, 128, 86, 18);
      ctx.beginPath();
      ctx.moveTo(142, 84);
      ctx.lineTo(176, 92);
      ctx.lineTo(142, 98);
      ctx.closePath();
      ctx.fill();
      circle(ctx, 88, 130, 14);
      circle(ctx, 168, 130, 14);
    },
  },
];

export function paintSprite(ctx: Ctx, w: number, spec: SpriteSpec) {
  ctx.clearRect(0, 0, w, 99999);

  // Draws the shape off the left edge and keeps only its blurred shadow.
  const soft = (
    color: string,
    blur: number,
    shift: number,
    draw: (target: Ctx) => void,
  ) => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = w;
    ctx.shadowOffsetY = 0;
    ctx.translate(-w + shift, shift);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    draw(ctx);
    ctx.restore();
  };

  soft("rgba(255,176,96,0.32)", 44, 0, spec.draw); // a warm halo
  soft(spec.color, 12, 0, spec.draw); // the soft body
  soft("rgba(255,238,205,0.38)", 6, -2, spec.draw); // a rim of light
  if (spec.detail) soft("rgba(255,238,205,0.4)", 7, -1, spec.detail);
}