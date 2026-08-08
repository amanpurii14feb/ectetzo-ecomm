import { Zap } from "lucide-react";
import Link from "next/link";
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-black tracking-tighter"
    >
      <span className="grid h-9 w-9 place-items-center rounded bg-volt text-ink">
        <Zap size={21} fill="currentColor" />
      </span>
      ELECTZO
    </Link>
  );
}
