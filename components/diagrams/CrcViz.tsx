"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import { crcSteps, type CrcStep } from "@/lib/algorithms/crc";

const AMBER = SKETCH.l2!;
const GREEN = SKETCH.l3!;

/** One frame of the CRC long division: the working register, with the generator
 *  aligned under the bits being XORed (or the remainder field highlighted). */
function DivisionStep({
  step,
  generator,
  crcWidth,
  index,
  total,
}: {
  step: CrcStep;
  generator: string;
  crcWidth: number;
  index: number;
  total: number;
}) {
  const bits = step.register.split("");
  const remainderStart = bits.length - crcWidth;

  return (
    <div className="overflow-x-auto p-4">
      <div
        className="inline-block font-mono text-lg leading-relaxed"
        role="img"
        aria-label={`Step ${index + 1} of ${total}: ${step.narration}`}
      >
        {/* Working register */}
        <div className="flex">
          {bits.map((b, i) => {
            const inGen = step.genPos !== null && i >= step.genPos && i < step.genPos + step.genLen;
            const inRemainder = step.remainder !== null && i >= remainderStart;
            return (
              <span
                key={i}
                className="inline-flex w-[1.1ch] justify-center"
                style={{
                  backgroundColor: inGen ? `${AMBER}33` : inRemainder ? `${GREEN}33` : undefined,
                  color: inRemainder ? GREEN : "var(--fg)",
                  fontWeight: inGen || inRemainder ? 700 : 400,
                  borderRadius: 2,
                }}
              >
                {b}
              </span>
            );
          })}
        </div>

        {/* Generator aligned under the current XOR window */}
        <div className="flex" style={{ minHeight: "1.6rem" }}>
          {step.genPos !== null
            ? generator.split("").map((g, j) => (
                <span
                  key={j}
                  className="inline-flex w-[1.1ch] justify-center font-bold"
                  style={{
                    marginLeft: j === 0 ? `${(step.genPos ?? 0) * 1.1}ch` : 0,
                    color: AMBER,
                  }}
                >
                  {g}
                </span>
              ))
            : step.remainder !== null
              ? (() => {
                  const labelOffset = remainderStart * 1.1;
                  return (
                    <span
                      className="text-sm"
                      style={{ marginLeft: `${labelOffset}ch`, color: GREEN }}
                    >
                      └ CRC = {step.remainder}
                    </span>
                  );
                })()
              : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive CRC long division: declare a binary message and generator
 * polynomial and step through the XOR-based polynomial division that produces the
 * Frame Check Sequence — the same computation Ethernet runs on every frame.
 */
export function CrcViz({
  message,
  generator,
  title = "CRC — polynomial long division for the Frame Check Sequence",
  caption,
}: {
  message: string;
  generator: string;
  title?: string;
  caption?: string;
}) {
  const steps = useMemo(() => crcSteps(message, generator), [message, generator]);
  const crcWidth = generator.length - 1;

  const summary = `Interactive CRC computation: the ${message.length}-bit message ${message} is augmented with ${crcWidth} zero bits and divided by the generator ${generator} using XOR. Step through each XOR to watch the remainder — the CRC / Frame Check Sequence — emerge in the low ${crcWidth} bits.`;

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={
        caption ??
        "Amber = the generator being XOR-ed in this step; green = the emerging CRC remainder. The receiver runs the same division over message + CRC and expects a zero remainder."
      }
      stepCount={steps.length}
      narration={(i) => steps[i]?.narration ?? ""}
      renderStep={(i) => (
        <DivisionStep
          step={steps[i]!}
          generator={generator}
          crcWidth={crcWidth}
          index={i}
          total={steps.length}
        />
      )}
    />
  );
}
