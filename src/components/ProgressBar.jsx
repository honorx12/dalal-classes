const ProgressBar = ({ progress, showLabel = false, size = 'default', color = 'gradient' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heights = {
    small: 'h-1',
    default: 'h-2',
    large: 'h-3',
  };

  const colorClasses = {
    gradient: 'bg-gradient-to-r from-accent-violet to-accent-cyan',
    violet: 'bg-accent-violet',
    cyan: 'bg-accent-cyan',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="w-full">
      <div className={`w-full ${heights[size]} bg-dark-bg rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs mt-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-accent-cyan font-medium">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
