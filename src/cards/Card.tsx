import { useEffect, useRef, useState } from "react";
import type { Card, Expansion, Fragment } from "../types";
import {
  AMBER_BBOX,
  FOUR_AEMBER,
  getClipPath,
  loadCardImage,
  type Zone,
} from "./card-utils";
import styles from "./Card.module.css";

type Props = {
  card: Card;
  house: string;
  expansion?: Expansion;
  hiddenZones?: Zone[];
  selectedFragments?: Fragment[];
  showResults?: Partial<Record<Zone, boolean>>;
  onImageError?: () => void;
};

export function Card({
  card,
  house,
  expansion,
  hiddenZones = [],
  selectedFragments = [],
  showResults,
  onImageError,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    const style = getComputedStyle(canvasRef.current);
    const bgColor = style.getPropertyValue("--bg").trim();
    const bgSubtleColor = style.getPropertyValue("--bg-subtle").trim();
    const textDimColor = style.getPropertyValue("--text-dim").trim();
    const correctColor = style.getPropertyValue("--color-success").trim();
    const incorrectColor = style.getPropertyValue("--color-error").trim();

    const fragmentImagePromises = selectedFragments.map(async (fragment) => {
      if (fragment.zone === "amber" && fragment.card.amber === 0) {
        return { fragment, image: null };
      }
      try {
        const image = await loadCardImage(
          fragment.card,
          fragment.house,
          expansion,
        );
        return { fragment, image };
      } catch {
        return { fragment, image: null };
      }
    });

    Promise.all([
      loadCardImage(card, house, expansion),
      Promise.all(fragmentImagePromises),
    ])
      .then(([image, loadedFragments]) => {
        if (cancelled || !canvasRef.current) return;

        ctx.clearRect(0, 0, 300, 420);
        ctx.drawImage(image, 0, 0, 300, 420);

        for (const zone of hiddenZones) {
          ctx.fillStyle = bgColor;
          if (zone === "amber") {
            ctx.fill(FOUR_AEMBER);
          } else {
            const path = getClipPath(card, zone);
            if (!path) continue;
            ctx.fill(path.path);
          }
        }

        for (const { fragment, image: fragImage } of loadedFragments) {
          if (fragment.zone === "amber") {
            if (fragment.card.amber === 0) {
              ctx.fillStyle = bgSubtleColor;
              ctx.fill(FOUR_AEMBER);
              ctx.fillStyle = textDimColor;
              ctx.font = "12px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              const cx = AMBER_BBOX.pos[0] + AMBER_BBOX.size[0] / 2;
              const cy = AMBER_BBOX.pos[1] + AMBER_BBOX.size[1] / 2;
              ctx.fillText("0", cx, cy);
            } else if (fragImage) {
              const path = getClipPath(fragment.card, "amber");
              if (path) {
                ctx.save();
                ctx.clip(path.path);
                ctx.drawImage(fragImage, 0, 0, 300, 420);
                ctx.restore();
              }
            }
          } else if (fragImage) {
            const path = getClipPath(fragment.card, fragment.zone);
            if (path) {
              ctx.save();
              ctx.clip(path.path);
              ctx.drawImage(fragImage, 0, 0, 300, 420);
              ctx.restore();
            }
          }
        }

        if (showResults) {
          for (const [zone, isCorrect] of Object.entries(showResults) as [
            Zone,
            boolean,
          ][]) {
            // A 0-Æmber card has no amber clip path; outline the same area
            // that gets hidden instead.
            const outline =
              zone === "amber" && !card.amber
                ? FOUR_AEMBER
                : getClipPath(card, zone)?.path;
            if (!outline) continue;
            // Dark halo so the outline stays visible over same-coloured art.
            ctx.strokeStyle = bgColor;
            ctx.lineWidth = 4;
            ctx.stroke(outline);
            ctx.strokeStyle = isCorrect ? correctColor : incorrectColor;
            ctx.lineWidth = 2;
            ctx.stroke(outline);
          }
        }

        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled && onImageError) onImageError();
      });

    return () => {
      cancelled = true;
    };
  }, [
    card,
    expansion,
    hiddenZones,
    house,
    onImageError,
    selectedFragments,
    showResults,
  ]);

  const classList = [styles.canvas, !loaded ? styles.placeholder : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <canvas
      className={classList}
      height="420px"
      width="300px"
      ref={canvasRef}
    />
  );
}
