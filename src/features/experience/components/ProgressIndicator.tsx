interface ProgressIndicatorProps {
  current: number;
  total: number;
}

function ProgressIndicator({
  current,
  total,
}: ProgressIndicatorProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-5 right-5 z-40 md:left-10 md:right-10">
      <div className="h-px bg-white/20">
        <div
          className="h-px bg-white transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressIndicator;