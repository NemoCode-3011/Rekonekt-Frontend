import type { Ref } from "react";
import { motion } from "framer-motion";
import {
  ACCENT_PATH,
  PAPER_SHADOW_OFFSET,
  RING,
  VIEWBOX,
  pieces,
  stitches,
} from "./splashArt";
import { T } from "./splashTimeline";

const THREAD = "#D8C7A9"; // sand
const INK = "#171914";
const SHADOW = "#D4955F"; // ochre light

// Each piece has its own weight, so they land one by one, not in step.
const SPRINGS = [
  { stiffness: 58, damping: 11 },
  { stiffness: 66, damping: 13 },
  { stiffness: 52, damping: 10 },
  { stiffness: 70, damping: 14 },
  { stiffness: 60, damping: 12 },
  { stiffness: 64, damping: 11 },
  { stiffness: 44, damping: 10 }, // the ochre piece: slower, it is the one that completes the ring
];

type Props = {
  started: boolean;
  reduced: boolean;
  className?: string;
  ref?: Ref<SVGSVGElement>;
};

/**
 * The O of REKÒ: a ring that was broken, brought back together piece by piece,
 * and mended with thread. Everything here is drawn by hand-set numbers (see
 * splashArt.ts), nothing is random at runtime.
 */
export default function SplashMark({ started, reduced, className, ref }: Props) {
  const go = started || reduced;

  const pieceMotion = (index: number) => {
    const piece = pieces[index];
    const spring = SPRINGS[index % SPRINGS.length];

    return {
      initial: reduced
        ? false
        : {
            x: piece.from.x,
            y: piece.from.y,
            rotate: piece.from.rotate,
            opacity: 0,
          },
      animate: go ? { x: 0, y: 0, rotate: 0, opacity: 1 } : undefined,
      transition: {
        type: "spring" as const,
        ...spring,
        mass: 1,
        delay: piece.delay,
        opacity: { duration: 0.3, delay: piece.delay },
      },
      style: { transformBox: "fill-box" as const, transformOrigin: "center" },
    };
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden
      className={className}
    >
      <defs>
        {/* A little unevenness on every edge, like ink pressed onto paper. It sits on the
            whole group, so neighbouring pieces wobble together and the cracks stay closed. */}
        <filter id="splash-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* When the accent lands, the whole ring gives a small thump, like a stamp. */}
      <motion.g
        style={{
          transformBox: "view-box",
          transformOrigin: `${RING.cx}px ${RING.cy}px`,
        }}
        animate={go && !reduced ? { scale: [1, 1.014, 1] } : undefined}
        transition={{ delay: T.accent + 0.26, duration: 0.35, ease: "easeOut" }}
      >
        <g filter="url(#splash-rough)">
          {/* The second colour, printed a hair off: one layer under all the pieces. */}
          {pieces.map((piece, i) => (
            <motion.g key={`shadow-${i}`} {...pieceMotion(i)}>
              <path
                d={piece.d}
                fill={piece.shadow}
                transform={`translate(${PAPER_SHADOW_OFFSET.x} ${PAPER_SHADOW_OFFSET.y})`}
              />
            </motion.g>
          ))}

          {pieces.map((piece, i) => (
            <motion.g key={`piece-${i}`} {...pieceMotion(i)}>
              <path d={piece.d} fill={piece.fill} />
            </motion.g>
          ))}

          {/* The accent drops onto the O and settles. */}
          <motion.g
            initial={reduced ? false : { y: -64, rotate: -18, opacity: 0 }}
            animate={go ? { y: 0, rotate: 0, opacity: 1 } : undefined}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 15,
              delay: T.accent,
              opacity: { duration: 0.15, delay: T.accent },
            }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <path
              d={ACCENT_PATH}
              fill={SHADOW}
              transform={`translate(${PAPER_SHADOW_OFFSET.x} ${PAPER_SHADOW_OFFSET.y})`}
            />
            <path d={ACCENT_PATH} fill={INK} />
          </motion.g>
        </g>

        {/* Thread: short stitches across each crack, pulled through one by one. */}
        {stitches.map((s) => (
          <motion.line
            key={`${s.seam}-${s.index}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={THREAD}
            strokeWidth={1.9}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={go ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: T.stitches + s.seam * T.seamGap + s.index * T.stitchGap,
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}