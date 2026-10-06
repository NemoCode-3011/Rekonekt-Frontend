interface ChapterIndicatorProps {
  number: number;
  title: string;
}

function ChapterIndicator({ number, title }: ChapterIndicatorProps) {
  return (
    <div className="flex items-center gap-4 font-sans text-label uppercase tracking-[0.16em]">
      <span className="text-ochre">
        {String(number).padStart(2, "0")}
      </span>

      <span className="h-px w-8 bg-current opacity-40" />

      <span className="text-current opacity-70">{title}</span>
    </div>
  );
}

export default ChapterIndicator;