export function JournalArt({ kind }: { kind: "journal" | "projects" | "chat" | "insights" }) {
  return (
    <div className={`journal-art journal-art-${kind}`} aria-hidden="true">
      <i /><i /><i />
    </div>
  );
}
