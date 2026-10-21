/* eslint-disable react-hooks/immutability -- three.js materials are updated every frame */
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, Html } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  Box3,
  BoxGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type PointLight,
} from "three";
import type { Phase } from "./ObjectScene";
import type { Vec3 } from "./objects";
import {
  HALL,
  PALETTE,
  SPRITES,
  paintCeiling,
  paintFloor,
  paintGlow,
  paintPlate,
  paintPost,
  paintSprite,
  paintWall,
} from "./hallPainters";

// ---------- Dials ----------

const WALL_BRIGHTNESS = 1; // lower it if the room competes with the head
const FINALE_LEVEL = 0.55; // how dim the room goes for "Where is it now?"

// An alcove: where the niche sits on the wall.
const ALCOVE = { bottom: 0.3, width: 3.0, height: 4.2 };

// Two glass cases on the floor.
//   x, z    where the case stands
//   sprite  the blurred treasure shown if there is no model (or while it loads)
//   model   OPTIONAL: a .glb in public/models, for example "/models/ife-head.glb"
//   turn    OPTIONAL: turns the model, in degrees, if it faces the wrong way
const CASES: {
  x: number;
  z: number;
  sprite: number;
  model?: string;
  turn?: number;
}[] = [
  { x: -3.9, z: -3.2, sprite: 1, model: "/models/ife.glb" },
  { x: 3.4, z: -3.8, sprite: 4, model: "/models/sokoto.glb" },
];

const ORISHA = [
  {
    image: "/orisha/esu.jpg",
    name: "Èṣù",
    title: "Òrìṣà of Crossroads & Messenger",
  },
  { image: "/orisha/ogun3.png", name: "Ògún", title: "Òrìṣà of Iron & Craft" },
  {
    image: "/orisha/sango3.jpg",
    name: "Ṣàngó",
    title: "Òrìṣà of Thunder & Lightning",
  },
  { image: "/orisha/oya.jpg", name: "Ọ̀yá", title: "Òrìṣà of Winds & Storms" },
  {
    image: "/orisha/yemoja.jpg",
    name: "Yemọja",
    title: "Mother of the Waters",
  },
  {
    image: "/orisha/obatala.png",
    name: "Ọbàtálá",
    title: "Òrìṣà of Purity & Creation",
  },
];

const NAMEPLATE_Y = 0.68; // the middle of the little pedestal: raise or lower it
const ZOOM_DISTANCE = 6; // how far from the wall the camera stops (smaller = closer)
const HOTSPOT_Y = 1.5; // how high the dot sits on the picture (raise or lower it)
const HOTSPOT_SIZE = 1.0; // how big it looks (the wall is far away, so it needs to be big)

type Controls = {
  target: Vector3;
  enabled: boolean;
  autoRotate: boolean;
  update: () => void;
};

const PORTRAIT_BRIGHTNESS = 1; // lower = moodier, higher = brighter
const PORTRAIT_FADE = 0.18; // how much of each edge melts into the wall (0.1 to 0.35)

// The biggest an object may be inside a case: width, height, depth (metres).
const CASE_FIT: [number, number, number] = [1.2, 0.82, 0.5];

// ---------- Building the pieces ----------

function paintedTexture(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (ctx) paint(ctx, width, height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function paintFade(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);

  const edge = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    rect: [number, number, number, number],
  ) => {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, "#000");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(...rect);
  };

  const sx = w * PORTRAIT_FADE;
  const sy = h * PORTRAIT_FADE;
  edge(0, 0, sx, 0, [0, 0, sx, h]);
  edge(w, 0, w - sx, 0, [w - sx, 0, sx, h]);
  edge(0, 0, 0, sy, [0, 0, w, sy]);
  edge(0, h, 0, h - sy, [0, h - sy, w, sy]);
}

function paintNameplate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  name: string,
  title: string,
) {
  ctx.clearRect(0, 0, w, h);

  const brass = ctx.createLinearGradient(0, 0, 0, h);
  brass.addColorStop(0, "#7a5a2b");
  brass.addColorStop(0.5, "#d2ad62");
  brass.addColorStop(1, "#6e5024");
  ctx.fillStyle = brass;
  ctx.fillRect(4, 4, w - 8, h - 8);

  ctx.strokeStyle = "rgba(40, 24, 8, 0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  ctx.fillStyle = "#2a1a0c";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 46px Newsreader, Georgia, serif";
  ctx.fillText(name.toUpperCase(), w / 2, h * 0.4);
  ctx.font = '400 22px "Instrument Sans", sans-serif';
  ctx.fillText(title, w / 2, h * 0.72);
}

function buildAssets(lowPower: boolean, alcoveCount: number) {
  const wallSize: [number, number] = lowPower ? [2048, 512] : [4096, 1024];
  const floorSize = lowPower ? 512 : 1024;

  const textures = {
    wall: paintedTexture(wallSize[0], wallSize[1], (c, w, h) =>
      paintWall(c, w, h, alcoveCount),
    ),
    floor: paintedTexture(floorSize, floorSize, paintFloor),
    ceiling: paintedTexture(512, 512, paintCeiling),
    post: paintedTexture(256, 256, paintPost),
    plate: paintedTexture(512, 720, paintPlate),
    glow: paintedTexture(256, 256, paintGlow),
    fade: paintedTexture(256, 384, paintFade),
    sprites: SPRITES.map((spec) =>
      paintedTexture(256, 384, (c, w) => paintSprite(c, w, spec)),
    ),
  };

  // The posts repeat their brass module around and up
  textures.post.wrapS = RepeatWrapping;
  textures.post.wrapT = RepeatWrapping;
  textures.post.repeat.set(2, 10);

  const flat = { toneMapped: false, fog: false } as const;

  const materials = {
    wall: new MeshBasicMaterial({
      map: textures.wall,
      side: BackSide,
      ...flat,
    }),
    ceiling: new MeshBasicMaterial({
      map: textures.ceiling,
      side: DoubleSide,
      ...flat,
    }),
    plate: new MeshBasicMaterial({
      map: textures.plate,
      transparent: true,
      depthWrite: false,
      ...flat,
    }),
    glow: new MeshBasicMaterial({
      map: textures.glow,
      color: "#ffb870",
      transparent: true,
      opacity: 0.55,
      blending: AdditiveBlending,
      depthWrite: false,
      ...flat,
    }),
    pool: new MeshBasicMaterial({
      map: textures.glow,
      color: "#ffb060",
      transparent: true,
      opacity: 0.35,
      blending: AdditiveBlending,
      depthWrite: false,
      ...flat,
    }),
    sprites: textures.sprites.map(
      (map) =>
        new MeshBasicMaterial({
          map,
          transparent: true,
          depthWrite: false,
          ...flat,
        }),
    ),
    floor: new MeshStandardMaterial({
      map: textures.floor,
      emissive: new Color("#ffffff"),
      emissiveMap: textures.floor,
      emissiveIntensity: 0.22,
      roughness: 0.32,
      metalness: 0.15,
      envMapIntensity: 0.6,
      fog: false,
    }),
    post: new MeshStandardMaterial({
      map: textures.post,
      emissive: new Color("#ffffff"),
      emissiveMap: textures.post,
      emissiveIntensity: 0.2,
      metalness: 0.55,
      roughness: 0.5,
      fog: false,
    }),
    trim: new MeshStandardMaterial({
      color: PALETTE.brass,
      metalness: 0.7,
      roughness: 0.35,
      envMapIntensity: 1.2,
      fog: false,
    }),
    caseWood: new MeshStandardMaterial({
      color: "#1d120c",
      roughness: 0.6,
      metalness: 0.1,
      fog: false,
    }),
    glass: new MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.1,
      roughness: 0,
      metalness: 0,
      envMapIntensity: 1.4,
      depthWrite: false,
      fog: false,
    }),
    lampBody: new MeshStandardMaterial({
      color: "#2a2018",
      metalness: 0.6,
      roughness: 0.4,
      fog: false,
    }),
    lampFace: new MeshBasicMaterial({ color: "#fff0cf", ...flat }),
  };

  const caseEdges = new EdgesGeometry(new BoxGeometry(1.5, 0.95, 0.7));

  const dispose = () => {
    Object.values(textures.sprites).forEach((texture) => texture.dispose());
    [
      textures.wall,
      textures.floor,
      textures.ceiling,
      textures.post,
      textures.plate,
      textures.glow,
      textures.fade,
    ].forEach((texture) => texture.dispose());
    materials.sprites.forEach((material) => material.dispose());
    Object.entries(materials).forEach(([key, material]) => {
      if (key !== "sprites") (material as MeshBasicMaterial).dispose();
    });
    caseEdges.dispose();
  };

  return { materials, caseEdges, fade: textures.fade, dispose };
}

// ---------- A real model inside a glass case ----------

// Sizes the model to fit the case and gives plain-coloured metal a bronze finish.
function prepareCaseModel(source: Parameters<Box3["setFromObject"]>[0]) {
  const object = source.clone(true);
  object.updateMatrixWorld(true);

  const materials: MeshStandardMaterial[] = [];

  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    const original = (
      Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    ) as MeshStandardMaterial;
    if (!original.isMeshStandardMaterial) return;

    const copy = original.clone();
    if (!copy.map) {
      copy.color = new Color("#8d5b2e");
      copy.metalness = 0.92;
      copy.roughness = 0.36;
    }

    mesh.material = copy;
    materials.push(copy);
  });

  const bounds = new Box3().setFromObject(object);
  const size = bounds.getSize(new Vector3());
  const centre = bounds.getCenter(new Vector3());

  if (size.x > 0 && size.y > 0 && size.z > 0) {
    const scale = Math.min(
      CASE_FIT[0] / size.x,
      CASE_FIT[1] / size.y,
      CASE_FIT[2] / size.z,
    );
    object.scale.setScalar(scale);
    object.position.set(
      -centre.x * scale,
      -bounds.min.y * scale,
      -centre.z * scale,
    );
  }

  return { object, materials };
}

function CaseModel({
  url,
  turn,
  level,
}: {
  url: string;
  turn: number;
  level: { value: number };
}) {
  const { scene } = useGLTF(url);
  const prepared = useMemo(() => prepareCaseModel(scene), [scene]);
  const light = useRef<PointLight>(null);

  // The model and its little lamp fade in with the rest of the room.
  useFrame(() => {
    prepared.materials.forEach((material) => {
      material.envMapIntensity = 1.3 * level.value;
    });
    if (light.current) light.current.intensity = 6 * level.value;
  });

  return (
    <group position={[0, 0.78, 0]}>
      <group rotation-y={(turn * Math.PI) / 180}>
        <primitive object={prepared.object} />
      </group>
      <pointLight
        ref={light}
        position={[0, 1.2, 0.5]}
        distance={3.5}
        decay={2}
        color="#ffd9a0"
      />
    </group>
  );
}

// What stands in a case: the model if there is one, otherwise the blurred treasure.
function CaseContents({
  model,
  turn,
  sprite,
  level,
}: {
  model?: string;
  turn: number;
  sprite: MeshBasicMaterial;
  level: { value: number };
}) {
  const blurred = (
    <mesh position={[0, 1.28, 0]}>
      <planeGeometry args={[0.62, 0.93]} />
      <primitive object={sprite} attach="material" />
    </mesh>
  );

  if (!model) return blurred;

  // If the file is missing or slow, the blurred treasure stays in the case.
  return (
    <Boundary fallback={blurred}>
      <Suspense fallback={blurred}>
        <CaseModel url={model} turn={turn} level={level} />
      </Suspense>
    </Boundary>
  );
}

function Portrait({
  url,
  fade,
  y,
  level,
  onSelect,
}: {
  url: string;
  fade: CanvasTexture;
  y: number;
  level: { value: number };
  onSelect: () => void;
}) {
  const photo = useTexture(url);
  photo.colorSpace = SRGBColorSpace;

  const material = useRef<MeshBasicMaterial>(null);

  const image = photo.image as { width: number; height: number };
  const aspect = image.width / image.height;
  let height = 3.2;
  let width = height * aspect;
  if (width > 2.8) {
    width = 2.8;
    height = width / aspect;
  }

  useFrame(() => {
    if (!material.current) return;
    const light = level.value * PORTRAIT_BRIGHTNESS;
    material.current.color.setRGB(light, light * 0.92, light * 0.8);
  });

  return (
    <mesh
      position={[0, y, 0.3]}
      onClick={onSelect}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={material}
        map={photo}
        alphaMap={fade}
        transparent
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}
function Nameplate({
  name,
  title,
  y,
  level,
}: {
  name: string;
  title: string;
  y: number;
  level: { value: number };
}) {
  const texture = useMemo(
    () =>
      paintedTexture(512, 128, (c, w, h) =>
        paintNameplate(c, w, h, name, title),
      ),
    [name, title],
  );
  const material = useRef<MeshBasicMaterial>(null);

  useEffect(() => {
    Promise.all([
      document.fonts.load("600 46px Newsreader"),
      document.fonts.load('400 22px "Instrument Sans"'),
    ]).then(() => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      paintNameplate(ctx, canvas.width, canvas.height, name, title);
      texture.needsUpdate = true;
    });
    return () => texture.dispose();
  }, [texture, name, title]);

  useFrame(() => {
    if (material.current) material.current.color.setScalar(level.value);
  });

  return (
    <mesh position={[0, y, 0.32]}>
      <planeGeometry args={[1.2, 0.3]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

function CameraRig({
  focus,
  count,
  reduced,
}: {
  focus: number | null;
  count: number;
  reduced: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls,
  ) as unknown as Controls | null;

  const home = useRef<{
    position: Vector3;
    target: Vector3;
    spin: boolean;
  } | null>(null);
  const looking = useRef(new Vector3()); // the point the camera is looking at right now
  const goal = useMemo(
    () => ({ position: new Vector3(), target: new Vector3() }),
    [],
  );
  const moving = useRef(false);
  const elapsed = useRef(0);

  // Runs each time a picture is chosen, or you go back.
  useEffect(() => {
    if (focus === null) {
      if (!home.current) return;
      goal.position.copy(home.current.position);
      goal.target.copy(home.current.target);
    } else {
      if (!home.current) {
        const target = controls
          ? controls.target.clone()
          : camera
              .getWorldDirection(new Vector3())
              .multiplyScalar(10)
              .add(camera.position);
        home.current = {
          position: camera.position.clone(),
          target,
          spin: controls ? controls.autoRotate : false,
        };
        looking.current.copy(target);
      }

      const angle = (focus / count) * Math.PI * 2;
      const wall = HALL.radius * 0.995;
      const picture = HALL.floorY + ALCOVE.bottom + ALCOVE.height / 2 + 0.09;

      goal.target.set(
        Math.sin(angle) * (wall - 0.3),
        picture,
        Math.cos(angle) * (wall - 0.3),
      );
      goal.position.set(
        Math.sin(angle) * (wall - ZOOM_DISTANCE),
        picture + 0.5,
        Math.cos(angle) * (wall - ZOOM_DISTANCE),
      );
      if (controls) {
        controls.enabled = false;
        controls.autoRotate = false;
      }
    }

    moving.current = true;
    elapsed.current = 0;
  }, [focus, count, camera, controls, goal]);

  // Glides a little closer to the goal on every frame.
  useFrame((_, delta) => {
    if (!moving.current) return;

    const step = reduced ? 1 : 1 - Math.exp(-delta * 3);
    camera.position.lerp(goal.position, step);
    looking.current.lerp(goal.target, step);

    if (controls) {
      controls.target.copy(looking.current);
      controls.update();
    } else {
      camera.lookAt(looking.current);
    }

    elapsed.current += delta;
    const arrived =
      camera.position.distanceTo(goal.position) < 0.02 &&
      looking.current.distanceTo(goal.target) < 0.02;
    if (!arrived && elapsed.current < 3) return;

    moving.current = false;
    if (focus === null) {
      if (controls) {
        controls.enabled = true;
        controls.autoRotate = home.current?.spin ?? false;
      }
      home.current = null;
    }
  });

  return null;
}

function Hotspot({
  y,
  level,
  reduced,
  hidden,
  onSelect,
}: {
  y: number;
  level: { value: number };
  reduced: boolean;
  hidden: boolean;
  onSelect: () => void;
}) {
  const wave = useRef<Mesh>(null);
  const waveMaterial = useRef<MeshBasicMaterial>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const coreMaterial = useRef<MeshBasicMaterial>(null);
  const shown = useRef(0); // 0 = invisible, 1 = fully visible

  useFrame(({ clock }, delta) => {
    // Fade away while a picture is zoomed, fade back in afterwards.
    const goal = hidden ? 0 : level.value;
    shown.current += (goal - shown.current) * (1 - Math.exp(-delta * 6));
    const show = shown.current;

    // The pulse: 0 to 1, over and over, every two seconds.
    const pulse = reduced ? 0.4 : (clock.elapsedTime % 2) / 2;

    if (wave.current) wave.current.scale.setScalar(1 + pulse * 1.6);
    if (waveMaterial.current)
      waveMaterial.current.opacity = (1 - pulse) * 0.7 * show;
    if (ringMaterial.current) ringMaterial.current.opacity = 0.9 * show;
    if (coreMaterial.current) {
      const blink = reduced ? 1 : 0.65 + 0.35 * Math.sin(clock.elapsedTime * 3);
      coreMaterial.current.opacity = blink * show;
    }
  });

  const glow = {
    color: "#ffd9a0",
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
    fog: false,
  } as const;

  return (
    <group
      position={[0, y, 0.36]}
      scale={HOTSPOT_SIZE}
      onClick={(event) => {
        event.stopPropagation();
        if (!hidden) onSelect();
      }}
      onPointerOver={() => {
        if (!hidden) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {/* An invisible, bigger circle, so the dot is easy to click or tap */}
      <mesh>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* The steady ring */}
      <mesh>
        <ringGeometry args={[0.2, 0.235, 48]} />
        <meshBasicMaterial ref={ringMaterial} {...glow} />
      </mesh>

      {/* The glowing dot in the middle */}
      <mesh>
        <circleGeometry args={[0.09, 32]} />
        <meshBasicMaterial ref={coreMaterial} {...glow} />
      </mesh>

      {/* The ring that grows and fades */}
      <mesh ref={wave}>
        <ringGeometry args={[0.2, 0.235, 48]} />
        <meshBasicMaterial ref={waveMaterial} {...glow} />
      </mesh>
    </group>
  );
}

// ---------- The hall ----------

export interface HallProps {
  lowPower: boolean;
  reduced: boolean;
  phase: Phase;
  finale: boolean;
  lightPosition: Vec3;
  focus: number | null; // which wall picture is zoomed (null = none)
  onFocus: (index: number | null) => void;
}

// Where picture number `index` hangs in the room.
function pictureSpot(index: number, count: number): Vec3 {
  const angle = (index / count) * Math.PI * 2;
  const wall = HALL.radius * 0.995 - 0.3;
  const height = HALL.floorY + ALCOVE.bottom + ALCOVE.height / 2 + 0.09;
  return [Math.sin(angle) * wall, height, Math.cos(angle) * wall];
}

function Hall({
  lowPower,
  reduced,
  phase,
  finale,
  lightPosition,
  focus,
  onFocus,
}: HallProps) {
  const count = lowPower ? HALL.lowPowerAlcoves : HALL.alcoves;
  const assets = useMemo(() => buildAssets(lowPower, count), [lowPower, count]);
  useEffect(() => () => assets.dispose(), [assets]);

  const { materials } = assets;

  // Esc goes back.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFocus(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFocus]);

  // The room appears slowly after the head is lit, and dims for the last question.
  const level = useMemo(() => ({ value: 0 }), []);

  const focusOn = (i: number) => {
    if (phase !== "explore" || level.value < 0.8) return; // wait for the arrival to finish
    document.body.style.cursor = "";
    onFocus(i);
  };

  useFrame((_, delta) => {
    const goal = phase === "loading" ? 0 : finale ? FINALE_LEVEL : 1;
    const rate = phase === "intro" ? 0.4 : 2;

    level.value = reduced
      ? goal
      : level.value + (goal - level.value) * (1 - Math.exp(-delta * rate));
    const amount = level.value;

    materials.wall.color.setScalar(amount * WALL_BRIGHTNESS);
    materials.ceiling.color.setScalar(amount);
    materials.plate.color.setScalar(amount);
    materials.sprites.forEach((material) => material.color.setScalar(amount));
    materials.glow.opacity = 0.55 * amount;
    materials.pool.opacity = 0.35 * amount;
    materials.floor.emissiveIntensity = 0.22 * amount;
    materials.post.emissiveIntensity = 0.2 * amount;
  });

  const alcoves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        sprite: (i * 3 + 1) % SPRITES.length,
      })),
    [count],
  );

  const posts = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, i) => ((i + 0.5) / count) * Math.PI * 2,
      ),
    [count],
  );

  // The spotlight fixture: a rod from the ceiling, and a lamp aimed at the head.
  const lamp = useMemo(() => {
    const position = new Vector3(...lightPosition);
    const back = position
      .clone()
      .sub(new Vector3(0, 1.5, 0))
      .normalize();
    const ceilingY = HALL.height + HALL.floorY;
    const rodLength = Math.max(ceilingY - position.y, 0.1);

    return {
      position,
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        back,
      ),
      rodLength,
      rodCentre: position.y + rodLength / 2,
    };
  }, [lightPosition]);

  const wallCentreY = HALL.height / 2 + HALL.floorY;
  const ceilingY = HALL.height + HALL.floorY;
  const alcoveY = ALCOVE.bottom + ALCOVE.height / 2;

  return (
    <group>
      <Boundary>
        <CameraRig focus={focus} count={count} reduced={reduced} />
        {focus !== null && (
          <Html
            fullscreen
            position={pictureSpot(focus, count)}
            pointerEvents="none"
          >
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-4 pb-8 pt-20 text-center"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
              }}
            >
              <div>
                <h2
                  className="text-3xl md:text-5xl"
                  style={{
                    fontFamily: "Newsreader, Georgia, serif",
                    color: "#e9dcc0",
                  }}
                >
                  {ORISHA[focus % ORISHA.length].name}
                </h2>
                <p
                  className="mt-1 text-xs uppercase tracking-widest md:text-sm"
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    color: "#d6a45f",
                  }}
                >
                  {ORISHA[focus % ORISHA.length].title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onFocus(null)}
                className="pointer-events-auto rounded-full border px-6 text-xs uppercase tracking-widest"
                style={{
                  minHeight: 44,
                  pointerEvents: "auto",
                  borderColor: "#d6a45f",
                  color: "#e9dcc0",
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                Back to the hall
              </button>
              <p
                className="hidden text-xs md:block"
                style={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  color: "#e9dcc0",
                  opacity: 0.6,
                }}
              >
                or press Esc
              </p>
            </div>
          </Html>
        )}
      </Boundary>
      {/* Walls, ceiling and floor */}
      <mesh position={[0, wallCentreY, 0]}>
        <cylinderGeometry
          args={[HALL.radius, HALL.radius, HALL.height, 96, 1, true]}
        />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      <mesh position={[0, ceilingY, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[HALL.radius, 64]} />
        <primitive object={materials.ceiling} attach="material" />
      </mesh>

      <mesh position={[0, -0.113, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[HALL.radius, 96]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>

      {/* The alcoves, each holding a blurred treasure */}
      {alcoves.map(({ angle }, i) => (
        <group
          key={i}
          position={[
            HALL.radius * 0.995 * Math.sin(angle),
            HALL.floorY,
            HALL.radius * 0.995 * Math.cos(angle),
          ]}
          rotation-y={angle + Math.PI}
        >
          <mesh position={[0, alcoveY, 0.02]}>
            <planeGeometry args={[ALCOVE.width, ALCOVE.height]} />
            <primitive object={materials.plate} attach="material" />
          </mesh>

          <mesh position={[0, alcoveY + 0.05, 0.16]}>
            <planeGeometry args={[3.2, 3.6]} />
            <primitive object={materials.glow} attach="material" />
          </mesh>

          <Boundary>
            <Suspense fallback={null}>
              <Portrait
                url={ORISHA[i % ORISHA.length].image}
                fade={assets.fade}
                y={alcoveY + 0.09}
                level={level}
                onSelect={() => focusOn(i)}
              />
            </Suspense>
          </Boundary>

          <Nameplate
            name={ORISHA[i % ORISHA.length].name}
            title={ORISHA[i % ORISHA.length].title}
            y={NAMEPLATE_Y}
            level={level}
          />

          <Hotspot
            y={HOTSPOT_Y}
            level={level}
            reduced={reduced}
            hidden={focus !== null}
            onSelect={() => focusOn(i)}
          />

          {/* A pool of warm light on the floor in front of it */}
          <mesh position={[0, 0.012, 1.9]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[4.2, 2.6]} />
            <primitive object={materials.pool} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Slim posts wrapped in brass plaques, like the pillars of the palace */}
      {posts.map((angle, i) => (
        <group
          key={i}
          position={[
            HALL.postRadius * Math.sin(angle),
            0,
            HALL.postRadius * Math.cos(angle),
          ]}
        >
          <mesh position={[0, wallCentreY, 0]}>
            <cylinderGeometry args={[0.24, 0.24, HALL.height, 24]} />
            <primitive object={materials.post} attach="material" />
          </mesh>
          <mesh position={[0, HALL.floorY + 0.15, 0]}>
            <cylinderGeometry args={[0.36, 0.4, 0.3, 24]} />
            <primitive object={materials.trim} attach="material" />
          </mesh>
          <mesh position={[0, ceilingY - 0.2, 0]}>
            <cylinderGeometry args={[0.4, 0.32, 0.4, 24]} />
            <primitive object={materials.trim} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Two glass cases */}
      {CASES.map((item, i) => (
        <group
          key={i}
          position={[item.x, HALL.floorY, item.z]}
          rotation-y={Math.atan2(-item.x, -item.z)}
        >
          <mesh position={[0, 0.375, 0]}>
            <boxGeometry args={[1.5, 0.75, 0.7]} />
            <primitive object={materials.caseWood} attach="material" />
          </mesh>

          <mesh position={[0, 0.78, 0.352]}>
            <boxGeometry args={[0.5, 0.05, 0.01]} />
            <primitive object={materials.trim} attach="material" />
          </mesh>

          <mesh position={[0, 1.38, -0.05]}>
            <planeGeometry args={[1.1, 0.95]} />
            <primitive object={materials.pool} attach="material" />
          </mesh>

          <CaseContents
            model={item.model}
            turn={item.turn ?? 0}
            sprite={materials.sprites[item.sprite]}
            level={level}
          />

          <lineSegments geometry={assets.caseEdges} position={[0, 1.225, 0]}>
            <lineBasicMaterial color={PALETTE.brass} />
          </lineSegments>

          <mesh position={[0, 1.225, 0]} renderOrder={2}>
            <boxGeometry args={[1.5, 0.95, 0.7]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>
        </group>
      ))}

      {/* The spotlight fixture */}
      <mesh position={[lamp.position.x, lamp.rodCentre, lamp.position.z]}>
        <cylinderGeometry args={[0.012, 0.012, lamp.rodLength, 8]} />
        <primitive object={materials.lampBody} attach="material" />
      </mesh>

      <group position={lamp.position} quaternion={lamp.quaternion}>
        <mesh>
          <cylinderGeometry args={[0.11, 0.11, 0.38, 24]} />
          <primitive object={materials.lampBody} attach="material" />
        </mesh>
        <mesh position={[0, -0.192, 0]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.1, 24]} />
          <primitive object={materials.lampFace} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// If anything in the hall fails, this is a fallback, the hall doesn't appear and the
// viewer carries on exactly as before.
class Boundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Part of the museum hall could not be shown:", error);
  }

  render() {
    return this.state.failed
      ? (this.props.fallback ?? null)
      : this.props.children;
  }
}

export default function MuseumHall(props: HallProps) {
  return (
    <Boundary>
      <Hall {...props} />
    </Boundary>
  );
}
