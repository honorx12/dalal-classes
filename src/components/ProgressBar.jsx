// src/components/ProgressBar.jsx
const ProgressBar = ({ progress, showLabel = false }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
