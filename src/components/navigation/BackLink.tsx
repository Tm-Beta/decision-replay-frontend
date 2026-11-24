"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const style = "inline-flex min-h-11 max-w-full w-fit items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

type Props = { children: ReactNode } & (
  { href: string } | { onClick: () => void; disabled?: boolean }
);

export function BackLink(props: Props) {
  const content = <>
    <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
    <span className="min-w-0 break-words">{props.children}</span>
  </>;
  return "href" in props
    ? <Link href={props.href} className={style}>{content}</Link>
    : <button type="button" className={style} disabled={props.disabled} onClick={props.onClick}>{content}</button>;
}
