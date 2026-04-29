import { useEffect, useRef, useState } from "react";
import type { Card } from "../types";
import { getClipPath, loadCardImage, type Zone } from "./card-utils";
import classNames from "classnames";

type Props = {
  card: Card;
  house: string;
  hiddenZones?: Zone[];
  showResults?: Partial<Record<Zone, boolean>>;
};

export function Card({ card, house, hiddenZones = [], showResults }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    loadCardImage(card.slug, house).then((image) => {
      ctx.drawImage(image, 0, 0, 300, 420);

      for (const zone of hiddenZones) {
        const path = getClipPath(card, zone);
        if (!path) continue;
        ctx.fillStyle = "black";
        ctx.fill(path.path);
      }

      if (showResults) {
        for (const zone of hiddenZones) {
          const isCorrect = showResults[zone];
          if (isCorrect === undefined) continue;
          const path = getClipPath(card, zone);
          if (!path) continue;
          ctx.strokeStyle = isCorrect ? "#22c55e" : "#ef4444";
          ctx.lineWidth = 4;
          ctx.stroke(path.path);
        }
      }

      setLoaded(true);
    });
  }, [card, hiddenZones, house, showResults]);

  return (
    <canvas
      style={{ height: "420px", width: "300px" }}
      className={classNames(!loaded && "no-card")}
      height="420px"
      width="300px"
      ref={canvasRef}
    />
  );
}
