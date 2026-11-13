import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useInView, useReducedMotion } from "framer-motion";
import {
  CubicBezierCurve,
  CubicBezierCurve3,
  DoubleSide,
  LatheGeometry,
  MeshStandardMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  type Group,
} from "three";

// A two-handled bronze urn, built from numbers: no model file, no picture.
// It turns slowly on a little plinth, so the handles swing round and the light
// slides across the metal. That is what tells the eye "this is 3D".
//
// Everything is in one unit: the urn is about 2.3 tall and 2.1 wide at the belly.

const v = (x: number, y: number) => new Vector2(x, y);
const curve = (a: Vector2, b: Vector2, c: Vector2, d: Vector2) =>
  new CubicBezierCurve(a, b, c, d).getPoints(24);

// The outline of the urn, bottom to top: (distance from the middle, height).
// Each curve starts where the last one ended, so its first point is dropped.
const PROFILE: Vector2[] = [
  v(0, 0),
  v(0.55, 0),
  ...curve(v(0.55, 0.08), v(0.55, 0.34), v(1.05, 0.5), v(1.05, 1.1)), // foot into belly
  ...curve(v(1.05, 1.1), v(1.05, 1.5), v(0.5, 1.5), v(0.5, 1.95)).slice(1), // belly into neck
  ...curve(v(0.5, 2.1), v(0.5, 2.24), v(0.62, 2.3), v(0.74, 2.32)), // the lip
];

// How far from the middle the urn is at a given height.
function radiusAt(y: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const a = PROFILE[i - 1];
    const b = PROFILE[i];
    if ((a.y - y) * (b.y - y) <= 0 && b.y !== a.y) {
      return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
    }
  }
  return 1;
}

const BANDS = [0.98, 1.1, 1.22]; // thin rings round the belly
const BODY_SEGMENTS = 96;

const bronze = {
  color: "#9b6a36",
  metalness: 0.92,
  roughness: 0.34,
  envMapIntensity: 1.3,
} as const;

function Vessel({ spin }: { spin: boolean }) {
  const turntable = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  const parts = useMemo(() => {
    // The handle runs from the neck, out and round, back to the shoulder.
    const reach = new CubicBezierCurve3(
      new Vector3(0.47, 1.9, 0),
      new Vector3(1.05, 2.08, 0),
      new Vector3(1.3, 1.55, 0),
      new Vector3(radiusAt(1.3) - 0.03, 1.3, 0),
    );

    return {
      body: new LatheGeometry(PROFILE, BODY_SEGMENTS),
      handle: new TubeGeometry(reach, 48, 0.055, 12, false),
      metal: new MeshStandardMaterial({ ...bronze, side: DoubleSide }),
      plinth: new MeshStandardMaterial({
        color: "#3a2a18",
        metalness: 0.6,
        roughness: 0.45,
      }),
    };
  }, []);

  // When nothing is moving (off screen, or reduced motion), draw one frame once
  // the reflections are ready, so the urn is never left black.
  useEffect(() => {
    const timer = window.setTimeout(invalidate, 250);
    return () => window.clearTimeout(timer);
  }, [invalidate]);

  useFrame((_, delta) => {
    if (spin && turntable.current) turntable.current.rotation.y += delta * 0.5;
  });

  return (
    <group position={[0, -1.1, 0]}>
      {/* The plinth stays still; only the urn turns */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.85, 0.9, 0.1, 64]} />
        <primitive object={parts.plinth} attach="material" />
      </mesh>

      <group ref={turntable} rotation-y={0.5}>
        <mesh geometry={parts.body} material={parts.metal} />

        {BANDS.map((y) => (
          <mesh
            key={y}
            position={[0, y, 0]}
            rotation-x={Math.PI / 2}
            material={parts.metal}
          >
            <torusGeometry args={[radiusAt(y) + 0.012, 0.026, 12, BODY_SEGMENTS]} />
          </mesh>
        ))}

        <mesh geometry={parts.handle} material={parts.metal} />
        <mesh geometry={parts.handle} material={parts.metal} rotation-y={Math.PI} />
      </group>
    </group>
  );
}

// The same warm reflections the 3D viewer uses, so the bronze looks like bronze.
function Reflections() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#ffe2b8"
        position={[0, 6, 2]}
        rotation-x={Math.PI / 2}
        scale={[6, 4, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#8fb59a"
        position={[-5, 2, 1]}
        rotation-y={Math.PI / 2}
        scale={[4, 5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        color="#d49a5b"
        position={[5, 2, -3]}
        rotation-y={-Math.PI / 2}
        scale={[4, 5, 1]}
      />
      <Lightformer
        form="ring"
        intensity={1}
        color="#f5f0e6"
        position={[0, 3, -6]}
        scale={5}
      />
    </Environment>
  );
}

// Fills whatever box it is put in. It only draws while it is on screen, and it
// never turns by itself for people who ask for reduced motion.
export default function ObjectPreview() {
  const box = useRef<HTMLDivElement>(null);
  const visible = useInView(box, { margin: "100px" });
  const reduce = useReducedMotion();
  const spin = visible && !reduce;

  return (
    <div ref={box} aria-hidden className="size-full">
      <Canvas
        dpr={[1, 2]}
        frameloop={spin ? "always" : "demand"}
        camera={{ position: [0, 0.8, 8.6], fov: 28 }}
        gl={{ antialias: true }}
        // Decorative: let touches and the wheel pass straight through to the page
        style={{ pointerEvents: "none", touchAction: "pan-y" }}
      >
        <Reflections />
        <directionalLight position={[3, 5, 4]} intensity={1.1} color="#ffe2b8" />
        <ambientLight intensity={0.15} />
        <Vessel spin={spin} />
      </Canvas>
    </div>
  );
}