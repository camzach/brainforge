import { useEffect, useRef, useState } from "react";
import type { Card } from "../types";
import { getClipPath, loadCardImage, type Zone } from "./card-utils";
import styles from "./Fragment.module.css";

const sketchpad = new OffscreenCanvas(1000, 1000);
const sketchpadCtx = sketchpad.getContext("2d")!;

type Props = {
  card: Card;
  house: string;
  zone: Zone;
  selected?: boolean;
  onClick?: () => void;
};

export function Fragment({ card, house, zone, selected, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const path = getClipPath(card, zone);

  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" },
    );

    observer.observe(canvasRef.current);
    return () => { observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (zone === "amber" && card.amber === 0) {
      const style = getComputedStyle(canvasRef.current);
      ctx.fillStyle = style.getPropertyValue("--bg-subtle").trim();
      ctx.fillRect(0, 0, path?.bbox.size[0] || 50, path?.bbox.size[1] || 125);
      ctx.fillStyle = style.getPropertyValue("--text-dim").trim();
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("0", (path?.bbox.size[0] || 50) / 2, (path?.bbox.size[1] || 125) / 2);
      return;
    }

    if (!path) return;

    loadCardImage(card.slug, house).then((image) => {
      sketchpadCtx.save();
      sketchpadCtx.clearRect(0, 0, 1000, 1000);
      sketchpadCtx.clip(path.path);
      sketchpadCtx.drawImage(image, 0, 0);
      sketchpadCtx.restore();

      ctx.drawImage(
        sketchpad,
        ...path.bbox.pos,
        ...path.bbox.size,
        0,
        0,
        ...path.bbox.size,
      );
    });
  }, [card, house, path, zone, isVisible]);

  const w = path?.bbox.size[0] ?? 1;
  const h = path?.bbox.size[1] ?? 1;

  // Target a consistent visual area (~9000px²) regardless of fragment shape.
  // max-width = sqrt(targetArea * aspectRatio), clamped to a min so tiny
  // fragments like amber pips aren't blown up too large.
  const targetArea = 9500;
  const maxW = Math.round(Math.sqrt(targetArea * (w / h)));

  const classList = [
    styles.clip,
    selected ? styles.selected : "",
  ].filter(Boolean).join(" ");

  return (
    <canvas
      className={classList}
      height={h}
      width={w}
      ref={canvasRef}
      onClick={onClick}
      style={{
        "--aspect-ratio": `${w} / ${h}`,
        "--max-w": `${maxW}px`,
      } as React.CSSProperties}
    />
  );
}
