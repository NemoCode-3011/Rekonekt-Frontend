import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Color,
  DoubleSide,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type PerspectiveCamera,
  type PointLight,
  type SpotLight,
} from "three";
import { Object3D as ThreeObject3D } from "three";
import type { ObjectConfig, ObjectStory, Vec3 } from "./objects";

export type Phase = "loading" | "intro" | "explore";

export interface PickResult {
  position: Vec3;
  normal: Vec3;
}

export interface SceneProps {
  config: ObjectConfig;
  stories: ObjectStory[]; // the markers visitors can see
  phase: Phase;
  activeIndex: number | null; // which marker is open (null = none)
  finale: boolean;
  reduced: boolean;
  lowPower: boolean;
  interacted: boolean;
  resetKey: number;
  calibrate: boolean;
  picked: PickResult | null;
  onReady: () => void;
  onIntroDone: () => void;
  onInteract: () => void;
  onSelect: (index: number) => void;
  onPick: (pick: PickResult) => void;
}

const PLINTH_TOP = 0.685; // the top of the pedestal
const MODEL_HEIGHT = 1.65;
const INTRO_SECONDS = 6.5;

const START_POSITION: Vec3 = [0.8, 1.2, 11];
const REST_POSITION: Vec3 = [3.4, 2.4, 5.4];
const REST_TARGET: Vec3 = [0, 1.45, 0];
const FINALE_POSITION: Vec3 = [5.4, 3.3, 8.4];
const FINALE_TARGET: Vec3 = [0, 1.25, 0];

const LIGHT_POSITION: Vec3 = [1.2, 5.5, 3.5];
const BEAM_BASE: Vec3 = [0, 0.3, 0];

// ---------- Camera: arrival, focus, full view ----------

interface ControlsLike {
  target: Vector3;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

function CameraRig({
  phase,
  focus,
  finale,
  reduced,
  resetKey,
  onIntroDone,
  onInteract,
}: {
  phase: Phase;
  focus: ObjectStory | null;
  finale: boolean;
  reduced: boolean;
  resetKey: number;
  onIntroDone: () => void;
  onInteract: () => void;
}) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const controls = useThree((state) => state.controls) as unknown as ControlsLike | null;
  const size = useThree((state) => state.size);

  const start = useMemo(() => new Vector3(...START_POSITION), []);
  const rest = useMemo(() => new Vector3(...REST_POSITION), []);
  const restTarget = useMemo(() => new Vector3(...REST_TARGET), []);

  const goalPosition = useRef(rest.clone());
  const goalTarget = useRef(restTarget.clone());
  const moving = useRef(false);
  const introTime = useRef(0);
  const introDone = useRef(false);

  // On a phone the picture is tall, so widen the lens a little.
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.fov = aspect < 0.75 ? 52 : aspect < 1 ? 44 : 36;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // Decide where the camera should be whenever the selection changes.
  useEffect(() => {
    if (phase !== "explore") return;

    if (finale) {
      goalPosition.current.set(...FINALE_POSITION);
      goalTarget.current.set(...FINALE_TARGET);
    } else if (focus) {
      const target = new Vector3(...focus.position);
      target.y += PLINTH_TOP;

      const normal = new Vector3(...(focus.normal ?? [0, 0, 1])).normalize();
      const right = new Vector3(normal.z, 0, -normal.x);
      if (right.lengthSq() < 1e-4) right.set(1, 0, 0);
      right.normalize();

      goalTarget.current.copy(target);
      goalPosition.current
        .copy(target)
        .addScaledVector(normal, 2.9)
        .addScaledVector(right, 0.9);
      goalPosition.current.y += 0.3;
    } else {
      goalPosition.current.copy(rest);
      goalTarget.current.copy(restTarget);
    }

    if (reduced) {
      camera.position.copy(goalPosition.current);
      controls?.target.copy(goalTarget.current);
      moving.current = false;
    } else {
      moving.current = true;
    }
  }, [phase, focus, finale, resetKey, reduced, camera, controls, rest, restTarget]);

  // If the visitor grabs the object, stop moving the camera for them.
  useEffect(() => {
    if (!controls) return;

    const handleStart = () => {
      moving.current = false;
      onInteract();
    };

    controls.addEventListener("start", handleStart);
    return () => controls.removeEventListener("start", handleStart);
  }, [controls, onInteract]);

  useFrame((_, delta) => {
    if (phase === "intro") {
      // A slow dolly in that settles gently.
      introTime.current += delta;
      const t = Math.min(introTime.current / INTRO_SECONDS, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(start, rest, eased);
      camera.lookAt(restTarget);
      controls?.target.copy(restTarget);

      if (t >= 1 && !introDone.current) {
        introDone.current = true;
        onIntroDone();
      }
      return;
    }

    if (!moving.current) return;

    const smoothing = 1 - Math.exp(-3.2 * delta);
    camera.position.lerp(goalPosition.current, smoothing);
    controls?.target.lerp(goalTarget.current, smoothing);

    const arrived =
      camera.position.distanceTo(goalPosition.current) < 0.015 &&
      (!controls || controls.target.distanceTo(goalTarget.current) < 0.015);

    if (arrived) moving.current = false;
  });

  return null;
}

// ---------- Light: it rises slowly, and dims for the final question ----------

function Lighting({
  phase,
  finale,
  lowPower,
}: {
  phase: Phase;
  finale: boolean;
  lowPower: boolean;
}) {
  const spot = useRef<SpotLight>(null);
  const rim = useRef<PointLight>(null);
  const fill = useRef<PointLight>(null);
  const level = useRef(0);

  const target = useMemo(() => {
    const object = new ThreeObject3D();
    object.position.set(0, 1.5, 0);
    return object;
  }, []);

  // A cone of light from the lamp down to the object.
  const beam = useMemo(() => {
    const from = new Vector3(...LIGHT_POSITION);
    const to = new Vector3(...BEAM_BASE);
    const direction = from.clone().sub(to);
    const length = direction.length();

    return {
      length,
      position: to.clone().add(direction.clone().multiplyScalar(0.5)),
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.normalize(),
      ),
      material: new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: {
          uColor: { value: new Color("#ffd9a0") },
          uLevel: { value: 0 },
        },
        vertexShader: `
          varying float vHeight;
          void main() {
            vHeight = uv.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying float vHeight;
          uniform vec3 uColor;
          uniform float uLevel;
          void main() {
            float alpha = pow(vHeight, 1.4) * 0.2 * uLevel;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
      }),
    };
  }, []);

  useEffect(() => () => beam.material.dispose(), [beam]);

  useFrame((_, delta) => {
    const goal = phase === "loading" ? 0 : finale ? 0.38 : 1;
    const rate = phase === "intro" ? 0.55 : 2.2; // a slow rise during the arrival

    level.current += (goal - level.current) * (1 - Math.exp(-delta * rate));

    if (spot.current) spot.current.intensity = 65 * level.current;
    if (rim.current) rim.current.intensity = 7 * level.current;
    if (fill.current) fill.current.intensity = 4 * level.current;
    beam.material.uniforms.uLevel.value = level.current;
  });

  return (
    <>
      <primitive object={target} />

      <ambientLight intensity={0.14} color="#c5d0c4" />

      <spotLight
        ref={spot}
        position={LIGHT_POSITION}
        target={target}
        angle={0.36}
        penumbra={0.85}
        distance={14}
        decay={1.5}
        color="#ffe0ad"
        castShadow={!lowPower}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* A warm edge light separates the bronze from the wall */}
      <pointLight ref={rim} position={[0.2, 3.2, -1.5]} distance={6} decay={2} color="#d49a5b" />

      {/* A restrained green fill from the left */}
      <pointLight ref={fill} position={[-2.8, 2.4, 1.4]} distance={7} decay={2} color="#4a795a" />

      <mesh position={beam.position} quaternion={beam.quaternion} material={beam.material}>
        <coneGeometry args={[1.5, beam.length, 48, 1, true]} />
      </mesh>
    </>
  );
}

// ---------- The room: wall, floor, a doorway of light, the pedestal ----------

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.22)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }

  return new CanvasTexture(canvas);
}

function Room() {
  const glow = useMemo(makeGlowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3, -4.2]}>
        <planeGeometry args={[24, 12]} />
        <meshStandardMaterial color="#0f2a20" roughness={1} />
      </mesh>

      {/* A soft green glow behind the object */}
      <mesh position={[0, 2, -3.9]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial
          map={glow}
          color="#2f7a59"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* A doorway drawn in light: an arch and two slim pillars */}
      <mesh position={[0, 1.45, -1.65]}>
        <torusGeometry args={[1.55, 0.016, 8, 100, Math.PI]} />
        <meshStandardMaterial
          color="#a66a3f"
          emissive="#a66a3f"
          emissiveIntensity={0.55}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {[-1.55, 1.55].map((x) => (
        <mesh key={x} position={[x, 0.675, -1.65]}>
          <boxGeometry args={[0.016, 1.55, 0.016]} />
          <meshStandardMaterial
            color="#a66a3f"
            emissive="#a66a3f"
            emissiveIntensity={0.55}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* A dark, slightly glossy floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <circleGeometry args={[16, 96]} />
        <meshStandardMaterial color="#0c120e" roughness={0.38} metalness={0.5} envMapIntensity={0.7} />
      </mesh>

      {/* The pedestal */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.95, 0.24, 64]} />
        <meshStandardMaterial color="#101a14" roughness={0.3} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.58, 0.38, 48]} />
        <meshStandardMaterial color="#17251c" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.07, 64]} />
        <meshStandardMaterial color="#b58a55" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.105, 0]}>
        <ringGeometry args={[1.04, 1.065, 96]} />
        <meshBasicMaterial color="#a66a3f" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ---------- Reflections, so the bronze has something to reflect ----------

function Reflections() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.4} color="#ffe2b8" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[6, 4, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#8fb59a" position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[4, 5, 1]} />
      <Lightformer form="rect" intensity={1.8} color="#d49a5b" position={[5, 2, -3]} rotation-y={-Math.PI / 2} scale={[4, 5, 1]} />
      <Lightformer form="ring" intensity={1} color="#f5f0e6" position={[0, 3, -6]} scale={5} />
    </Environment>
  );
}

// ---------- The object ----------

// Sizes the model to fit the pedestal, makes it cast shadows, and gives
// plain-colored metal a bronze finish so it never looks flat.
function prepareModel(source: Object3D) {
  const clone = source.clone(true);
  clone.updateMatrixWorld(true);

  clone.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
    if (!material.isMeshStandardMaterial) return;

    const copy = material.clone();
    copy.envMapIntensity = 1.3;

    if (!copy.map) {
      copy.color = new Color("#8d5b2e");
      copy.metalness = 0.92;
      copy.roughness = 0.36;
    }

    mesh.material = copy;
  });

  const bounds = new Box3().setFromObject(clone);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());

  if (size.y > 0) {
    const scale = MODEL_HEIGHT / size.y;
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  }

  return clone;
}

// A numbered marker. It fades away when it faces away from the camera,
// so it never floats through the back of the head.
function Marker({
  story,
  index,
  active,
  visible,
  onSelect,
}: {
  story: ObjectStory;
  index: number;
  active: boolean;
  visible: boolean;
  onSelect: (index: number) => void;
}) {
  const anchor = useRef<Group>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const camera = useThree((state) => state.camera);

  const worldPosition = useMemo(() => new Vector3(), []);
  const toCamera = useMemo(() => new Vector3(), []);
  const facing = useMemo(
    () => new Vector3(...(story.normal ?? [0, 0, 1])).normalize(),
    [story.normal],
  );

  useFrame(() => {
    if (!anchor.current || !wrapper.current) return;

    anchor.current.getWorldPosition(worldPosition);
    toCamera.copy(camera.position).sub(worldPosition).normalize();

    const amount = facing.dot(toCamera);
    const opacity = visible ? Math.min(Math.max((amount - 0.05) / 0.25, 0), 1) : 0;

    wrapper.current.style.opacity = String(opacity);
    wrapper.current.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
  });

  return (
    <group ref={anchor} position={story.position}>
      <Html center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div ref={wrapper} style={{ opacity: 0 }}>
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Look closer: ${story.title}`}
            aria-pressed={active}
            className="group relative grid size-10 place-items-center rounded-full outline-none"
          >
            {!active && (
              <span className="absolute inset-0 animate-ping rounded-full border border-ochre/80 motion-reduce:animate-none" />
            )}

            <span
              className={`relative grid size-7 place-items-center rounded-full border font-sans text-[10px] font-medium tracking-wider transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ivory ${
                active
                  ? "border-ivory bg-ivory text-ink"
                  : "border-ivory/70 bg-ink/60 text-ivory backdrop-blur-sm group-hover:border-ivory group-hover:bg-ochre"
              }`}
            >
              {index + 1}
            </span>

            <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap bg-ink/85 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-ivory opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
              {story.label}
            </span>
          </button>
        </div>
      </Html>
    </group>
  );
}

function Artifact({
  config,
  stories,
  activeIndex,
  phase,
  calibrate,
  picked,
  onSelect,
  onPick,
}: Pick<
  SceneProps,
  "config" | "stories" | "activeIndex" | "phase" | "calibrate" | "picked" | "onSelect" | "onPick"
>) {
  const { scene } = useGLTF(config.modelUrl);
  const model = useMemo(() => prepareModel(scene), [scene]);

  // In calibrate mode, clicking the model reports where you clicked,
  // relative to the pedestal, ready to paste into objects.ts.
  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (!calibrate) return;
    event.stopPropagation();

    const point = event.point.clone();
    point.y -= PLINTH_TOP;

    const normal = event.face
      ? event.face.normal.clone().transformDirection(event.object.matrixWorld)
      : new Vector3(0, 0, 1);

    onPick({
      position: [point.x, point.y, point.z],
      normal: [normal.x, normal.y, normal.z],
    });
  }

  return (
    <group position={[0, PLINTH_TOP, 0]}>
      <primitive object={model} onClick={handleClick} />

      {stories.map((story, index) => (
        <Marker
          key={story.id}
          story={story}
          index={index}
          active={activeIndex === index}
          visible={phase === "explore"}
          onSelect={onSelect}
        />
      ))}

      {calibrate && picked && (
        <mesh position={picked.position}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#ff3df2" />
        </mesh>
      )}
    </group>
  );
}

// Tells the page the model has loaded, so the arrival can begin.
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

// ---------- The scene ----------

export default function ObjectScene(props: SceneProps) {
  const { config, stories, phase, activeIndex, finale, reduced, lowPower, interacted } = props;

  const focus = activeIndex !== null && activeIndex < stories.length ? stories[activeIndex] : null;
  const autoRotate = phase === "explore" && !interacted && activeIndex === null && !reduced;

  return (
    <Canvas
      shadows={!lowPower}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ position: START_POSITION, fov: 36, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#050806"]} />
      <fog attach="fog" args={["#050806", 9, 21]} />

      <Suspense fallback={null}>
        <Reflections />
        <Lighting phase={phase} finale={finale} lowPower={lowPower} />
        <Room />

        <ContactShadows
          position={[0, PLINTH_TOP + 0.005, 0]}
          opacity={0.65}
          scale={3}
          blur={2.4}
          far={1.6}
          resolution={512}
        />

        {!reduced && (
          <Sparkles
            count={lowPower ? 30 : 70}
            scale={[3.6, 4.4, 3.6]}
            position={[0, 2, 0]}
            size={2.2}
            speed={0.25}
            opacity={0.55}
            color="#e8d2a6"
          />
        )}

        <Artifact
          config={config}
          stories={stories}
          activeIndex={activeIndex}
          phase={phase}
          calibrate={props.calibrate}
          picked={props.picked}
          onSelect={props.onSelect}
          onPick={props.onPick}
        />

        <Ready onReady={props.onReady} />
      </Suspense>

      <CameraRig
        phase={phase}
        focus={focus}
        finale={finale}
        reduced={reduced}
        resetKey={props.resetKey}
        onIntroDone={props.onIntroDone}
        onInteract={props.onInteract}
      />

      <OrbitControls
        makeDefault
        enabled={phase !== "intro"}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={2.4}
        maxDistance={9}
        minPolarAngle={0.5}
        maxPolarAngle={Math.PI / 2 - 0.04}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
        target={REST_TARGET}
      />
    </Canvas>
  );
}