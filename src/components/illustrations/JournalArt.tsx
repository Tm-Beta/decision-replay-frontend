"use client";

import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { CharacterId, CharacterPreferences } from "@/lib/preferences";

type Scene = "journal" | "projects" | "chat" | "insights" | "notifications";
type Reaction =
  | "idle"
  | "listening"
  | "thinking"
  | "due"
  | "resting"
  | "celebrating"
  | "sorting"
  | "curious"
  | "proud";

const characterObjects: Record<CharacterId, readonly [string, string, string]> = {
  sprout: ["leaf", "seed", "terrarium"],
  lumi: ["moon", "star", "cloud"],
  pebble: ["cloud", "lantern", "notebook"],
  spark: ["paper-plane", "star", "sparkle-gem"],
  mochi: ["petal", "boba", "cloud"],
  nova: ["sparkle-gem", "paper-plane", "moon"],
};

function getSceneObjects(charId: CharacterId, kind: Scene): readonly [string, string, string] {
  const base = characterObjects[charId] ?? characterObjects.sprout;
  if (charId === "sprout") {
    if (kind === "journal") return ["notebook", "leaf", "petal"];
    if (kind === "projects") return ["seed-packet", "seed", "leaf"];
    if (kind === "insights") return ["terrarium", "seed", "petal"];
    if (kind === "notifications") return ["lantern", "moon", "petal"];
  }
  return base;
}

export function JournalArt({
  kind,
  reaction = "idle",
  compact = false,
  miniScene = false,
  characterOverride,
}: {
  kind: Scene;
  reaction?: Reaction;
  compact?: boolean;
  miniScene?: boolean;
  characterOverride?: CharacterPreferences;
}) {
  const { preferences } = useTheme();
  const [poked, setPoked] = React.useState(false);
  const char = characterOverride ?? preferences.character;
  const charId = char.id || "sprout";
  const sceneObjs = getSceneObjects(charId, kind);
  const showFloating = miniScene || preferences.showFloatingArt !== false;
  const customTint =
    char.color && char.color !== "auto" ? char.color : undefined;
  const effectiveReaction = poked ? "celebrating" : reaction;

  const handlePoke = () => {
    if (compact || miniScene) return;
    setPoked(true);
    window.setTimeout(() => setPoked(false), 1400);
  };

  return (
    <div
      onClick={handlePoke}
      className={`journal-art journal-art-${kind} ${!compact && !miniScene ? "cursor-pointer" : ""}`}
      data-reaction={effectiveReaction}
      data-compact={compact || undefined}
      data-mini-scene={miniScene || undefined}
      data-character={charId}
      data-shape={char.shape || "classic"}
      data-eyes={char.eyes || "dots"}
      data-accessory={char.accessory || "leaf"}
      data-energy={char.energy || "lively"}
      style={
        customTint
          ? ({ "--char-tint": customTint } as React.CSSProperties)
          : undefined
      }
      aria-hidden="true"
    >
      {!compact && showFloating && (
        <div className="sprout-scene">
          {sceneObjs.map((object) => (
            <span
              className={`sprout-float sprout-object object-${object}`}
              key={object}
            />
          ))}
        </div>
      )}
      <span className="sprout-orbit" />
      <span className="sprout-spark" />
      <span className="sprout-shadow" />
      <span className="sprout">
        <span className="char-ears" />
        <span className="sprout-leaves" />
        <span className="char-accessory" />
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
  const { preferences } = useTheme();
  if (preferences.showFloatingArt === false) return null;
  const sceneObjs = getSceneObjects(preferences.character.id || "sprout", kind);
  return (
    <div
      className={`floating-details floating-details-${kind}`}
      aria-hidden="true"
    >
      {sceneObjs.map((object) => (
        <span className={`sprout-object object-${object}`} key={object} />
      ))}
    </div>
  );
}
