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
  stopObstacles: DOMRect[] = [],
): Point[] {
  const right = viewport.width - guide.width - gap;
  const bottom = viewport.height - guide.height - gap;
  const topLimit = gap;
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

  const canStop = (point: Point) => stopObstacles.every(box =>
    point.x + guide.width + gap <= box.left || point.x - gap >= box.right ||
    point.y + guide.height + gap <= box.top || point.y - gap >= box.bottom,
  );
  const available = [...points.values()].filter(canStop);
  if (!available.length) return [];
  if (!previous || !isClear(previous)) {
    return [available[Math.floor(Math.random() * available.length)]];
  }

  const clearSegment = (from: Point, to: Point) => obstacles.every(box =>
    Math.min(from.x, to.x) - gap >= box.right ||
    Math.max(from.x, to.x) + guide.width + gap <= box.left ||
    Math.min(from.y, to.y) - gap >= box.bottom ||
    Math.max(from.y, to.y) + guide.height + gap <= box.top,
  );
  const freshStops = available.filter(point =>
    Math.hypot(point.x - previous.x, point.y - previous.y) > spacing * 4 &&
    visited.every(stop => Math.hypot(point.x - stop.x, point.y - stop.y) > spacing * 2),
  );

  // Prefer a single soft arc when it fits, then use the grid around controls.
  for (let attempt = 0; attempt < 12 && freshStops.length; attempt++) {
    const end = freshStops[Math.floor(Math.random() * freshStops.length)];
    const dx = end.x - previous.x;
    const dy = end.y - previous.y;
    const bend = (Math.random() < .5 ? -1 : 1) * .18;
    const control = { x: previous.x + dx / 2 - dy * bend, y: previous.y + dy / 2 + dx * bend };
    const arc = Array.from({ length: 17 }, (_, index) => {
      const t = index / 16;
      const u = 1 - t;
      return {
        x: u * u * previous.x + 2 * u * t * control.x + t * t * end.x,
        y: u * u * previous.y + 2 * u * t * control.y + t * t * end.y,
      };
    });
    if (arc.every((point, index) => isClear(point) && (!index || clearSegment(arc[index - 1], point)))) return arc;
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
      if (!clearSegment(point, next)) continue;
      parents.set(key(next), point);
      queue.push(next);
    }
  }

  const destinations = queue.slice(1).filter(point =>
    Math.abs(point.x - previous.x) >= spacing * 2 &&
    Math.abs(point.y - previous.y) >= spacing * 2 &&
    visited.every(stop => Math.hypot(point.x - stop.x, point.y - stop.y) > spacing * 2),
  );
  const candidates = (destinations.length ? destinations : queue.slice(1)).filter(canStop);
  const fallback = queue.slice(1).filter(canStop);
  const stops = candidates.length ? candidates : fallback;
  let point: Point | null = stops[Math.floor(Math.random() * stops.length)] ?? (canStop(previous) ? previous : null);
  const route: Point[] = [];
  while (point) {
    route.push(point);
    point = parents.get(key(point)) ?? null;
  }
  return route.reverse();
}
