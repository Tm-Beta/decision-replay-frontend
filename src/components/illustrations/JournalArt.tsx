type Scene = "journal" | "projects" | "chat" | "insights" | "notifications";

const objects = {
  journal: ["notebook", "leaf", "petal"],
  projects: ["seed-packet", "seed", "leaf"],
  chat: ["paper-plane", "cloud", "petal"],
  insights: ["terrarium", "seed", "petal"],
  notifications: ["lantern", "moon", "petal"],
} as const;

type Reaction = "idle" | "listening" | "thinking" | "due" | "resting" | "celebrating" | "sorting";

export function JournalArt({ kind, reaction = "idle", compact = false }: {
  kind: Scene;
  reaction?: Reaction;
  compact?: boolean;
}) {
  return (
    <div className={`journal-art journal-art-${kind}`} data-reaction={reaction} data-compact={compact || undefined} aria-hidden="true">
      {!compact && <div className="sprout-scene">
        {objects[kind].map(object => <span className={`sprout-float sprout-object object-${object}`} key={object} />)}
      </div>}
      <span className="sprout-orbit" />
      <span className="sprout-spark" />
      <span className="sprout-shadow" />
      <span className="sprout">
        <span className="sprout-leaves" />
        <span className="sprout-arm" />
        <span className="sprout-body">
          <span className="sprout-eyes" />
          <span className="sprout-smile" />
          <span className="sprout-cheeks" />
        </span>
      </span>
      <span className="sprout-prop" />
    </div>
  );
}

export function FloatingDetails({ kind }: { kind: Scene }) {
  return (
    <div className={`floating-details floating-details-${kind}`} aria-hidden="true">
      {objects[kind].map(object => <span className={`sprout-object object-${object}`} key={object} />)}
    </div>
  );
}
