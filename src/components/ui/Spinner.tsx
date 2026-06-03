export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div className={`${s} border-2 border-nexora-200 border-t-nexora-600 rounded-full animate-spin`} />
  );
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <div className="w-2 h-2 rounded-full bg-nexora-400 dot-1" />
      <div className="w-2 h-2 rounded-full bg-nexora-400 dot-2" />
      <div className="w-2 h-2 rounded-full bg-nexora-400 dot-3" />
    </div>
  );
}
