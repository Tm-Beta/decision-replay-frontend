type Point = { x: number; y: number };
type Area = { width: number; height: number };

const gap = 8;
const spacing = 16;

export function findWelcomeRoute(
  viewport: Area,
  guide: Area,
  obstacles: DOMRect[],
  previous: Point | undefined,
  visited: Point[],
  sprintPast: DOMRect[] = [],
): Point[] {
  const right = viewport.width - guide.width - gap;
  const bottom = viewport.height - guide.height - gap;
  const topLimit = Math.max(gap, Math.min(Math.round(viewport.height * .6), bottom));
  const isClear = ({ x, y }: Point) =>
    x >= gap && y >= topLimit && x <= right && y <= bottom &&
    obstacles.every(box =>
      x + guide.width + gap <= box.left || x - gap >= box.right ||
      y + guide.height + gap <= box.top || y - gap >= box.bottom,
    );

  const points = new Map<string, Point>();
  const startX = previous?.x ?? gap;
  const startY = previous?.y ?? bottom;
  for (let x = startX - Math.floor((startX - gap) / spacing) * spacing; x <= right; x += spacing) {
    for (let y = startY - Math.floor((startY - topLimit) / spacing) * spacing; y <= bottom; y += spacing) {
      const point = { x, y };
      if (isClear(point)) points.set(key(point), point);
    }
  }

  function key({ x, y }: Point) {
    return Math.round(x) + ":" + Math.round(y);
  }

  const available = [...points.values()];
  if (!available.length) return [];
  if (!previous || !isClear(previous)) {
    return [available[Math.floor(Math.random() * available.length)]];
  }

  const queue = [previous];
  const parents = new Map<string, Point | null>([[key(previous), null]]);
  const diagonals = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const offset = Math.floor(Math.random() * diagonals.length);
  const directions = [...diagonals.slice(offset), ...diagonals.slice(0, offset),
    [0, 1], [1, 0], [0, -1], [-1, 0]];

  for (let index = 0; index < queue.length; index++) {
    const point = queue[index];
    for (const [dx, dy] of directions) {
      const next = points.get(key({ x: point.x + dx * spacing, y: point.y + dy * spacing }));
      if (!next || parents.has(key(next))) continue;
      const left = Math.min(point.x, next.x);
      const top = Math.min(point.y, next.y);
      const rightEdge = Math.max(point.x, next.x) + guide.width;
      const bottomEdge = Math.max(point.y, next.y) + guide.height;
      if (obstacles.some(box =>
        left - gap < box.right && rightEdge + gap > box.left &&
        top - gap < box.bottom && bottomEdge + gap > box.top,
      )) continue;
      parents.set(key(next), point);
      queue.push(next);
    }
  }

  const destinations = queue.slice(1).filter(point =>
    Math.abs(point.x - previous.x) >= spacing * 2 &&
    Math.abs(point.y - previous.y) >= spacing * 2 &&
    visited.every(stop => Math.hypot(point.x - stop.x, point.y - stop.y) > spacing * 2),
  );
  const candidates = sprintPast.length
    ? queue.slice(1).filter(point => {
        const leftSide = previous.x < viewport.width / 2;
        const oppositeSide = leftSide ? point.x > viewport.width * .64 : point.x < viewport.width * .32;
        return oppositeSide && sprintPast.every(box =>
          point.x + guide.width + gap <= box.left || point.x - gap >= box.right ||
          point.y + guide.height + gap <= box.top || point.y - gap >= box.bottom,
        );
      })
    : destinations.length ? destinations : queue.slice(1);
  let point: Point | null = candidates[Math.floor(Math.random() * candidates.length)] ?? previous;
  const route: Point[] = [];
  while (point) {
    route.push(point);
    point = parents.get(key(point)) ?? null;
  }
  return route.reverse();
}
