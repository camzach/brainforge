import { useEffect, useRef, useState } from "react";
import type { Card } from "../types";
import {
  FOUR_AEMBER,
  getClipPath,
  loadCardImage,
  type Zone,
} from "./card-utils";
import styles from "./Card.module.css";

type Props = {
  card: Card;
  house: string;
  hiddenZones?: Zone[];
  showResults?: Partial<Record<Zone, boolean>>;
  onImageError?: () => void;
};

export function Card({
  card,
  house,
  hiddenZones = [],
  showResults,
  onImageError,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvasRef.current);
    const bgColor = style.getPropertyValue("--bg").trim();
    const correctColor = style.getPropertyValue("--color-correct").trim();
    const incorrectColor = style.getPropertyValue("--color-incorrect").trim();

    loadCardImage(card.slug, house)
      .then((image) => {
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

        if (showResults) {
          for (const zone of hiddenZones) {
            const isCorrect = showResults[zone];
            if (isCorrect === undefined) continue;
            const path = getClipPath(card, zone);
            if (!path) continue;
            ctx.strokeStyle = isCorrect ? correctColor : incorrectColor;
            ctx.lineWidth = 4;
            ctx.stroke(path.path);
          }
        }

        setLoaded(true);
      })
      .catch(() => {
        if (onImageError) onImageError();
      });
  }, [card, hiddenZones, house, onImageError, showResults]);

  const classList = [
    styles.canvas,
    !loaded ? styles.placeholder : "",
  ].filter(Boolean).join(" ");

  return (
    <canvas
      className={classList}
      height="420px"
      width="300px"
      ref={canvasRef}
    />
  );
}
