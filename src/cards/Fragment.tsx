import { useEffect, useRef } from "react";
import type { Card, Fragment } from "../types";
import { getClipPath, loadCardImage, type Zone } from "./card-utils";
import classNames from "classnames";

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
  const path = getClipPath(card, zone);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Handle 0 pips case - show placeholder
    if (zone === "amber" && card.amber === 0) {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, path?.bbox.size[0] || 50, path?.bbox.size[1] || 125);
      ctx.fillStyle = "#666";
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
  }, [card, house, path, zone]);

  const aspectRatio = path && path.bbox.size[1] > 0
    ? path.bbox.size[0] / path.bbox.size[1]
    : 1;

  return (
    <canvas
      className={classNames("fragment-clip", selected && "selected")}
      height={`${path?.bbox.size[1]}px`}
      width={`${path?.bbox.size[0]}px`}
      ref={canvasRef}
      onClick={onClick}
      style={{ '--aspect-ratio': aspectRatio } as React.CSSProperties}
    />
  );
}
