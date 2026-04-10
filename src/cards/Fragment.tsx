import { useEffect, useRef } from "react";
import type { Card, Fragment } from "../types";
import { getZoneRect, loadCardImage, type Zone } from "./card-utils";
import classNames from "classnames";

type Props = {
  card: Card;
  house: string;
  zone: Zone;
  selected?: boolean;
  onClick?: () => void;
};

export function Fragment({ card, house, zone, selected, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoneRect = getZoneRect(card, zone);
  const [width, height] = zoneRect?.size ?? [0, 0];

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    loadCardImage(card.slug, house).then((image) => {
      const rect = getZoneRect(card, zone);
      if (!rect) return;

      const { pos, size } = rect;
      ctx.drawImage(image, ...pos, ...size, 0, 0, ...size);
    });
  }, [card, house, zone]);

  return (
    <canvas
      className={classNames("fragment-clip", selected && "selected")}
      height={`${height}px`}
      width={`${width}px`}
      ref={canvasRef}
      onClick={onClick}
    />
  );
}
