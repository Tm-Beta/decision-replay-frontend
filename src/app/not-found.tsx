"use client";

import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { JournalArt } from "@/components/illustrations/JournalArt";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CHARACTER_CATALOG } from "@/lib/preferences";

export default function NotFoundPage() {
  const { preferences } = useTheme();
  const charName =
    preferences.character.name?.trim() ||
    CHARACTER_CATALOG[preferences.character.id]?.defaultName ||
    "Sprout";

  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 min-h-[62vh]">
      <div className="mb-2">
        <JournalArt kind="chat" reaction="curious" />
      </div>

      <span className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
        404 · Page Not Found
      </span>

      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
        Hmm… {charName} couldn&apos;t find that path.
      </h1>

      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        This branch doesn&apos;t exist or may have moved. Head back to your journal or collections.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-95 transition"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <Link
          href="/decisions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card/80 text-sm font-semibold hover:bg-muted transition"
        >
          <FolderOpen size={16} /> Collections
        </Link>
      </div>
    </section>
  );
}

