"use client";

export default function ProgressRing({ progress = 0, size = 52, stroke = 4 }) {
  const clamped = Math.min(100, Math.max(0, progress));
  const r       = (size - stroke * 2) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (clamped / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="progress-ring"
      aria-label={`${progress}% complete`}
    >
      <circle className="progress-ring__track" cx={size / 2} cy={size / 2} r={r} />
      <circle
        className="progress-ring__fill"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
}