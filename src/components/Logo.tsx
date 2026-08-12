import { RatioMark } from "@/components/RatioMark";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-black tracking-tighter text-xl cursor-pointer select-none">
      <RatioMark className="h-6 w-6" />
      <span className="text-amber-500">WW</span>
      <span className="text-zinc-200 font-light italic tracking-tight">
        tellme
      </span>
    </div>
  );
}
