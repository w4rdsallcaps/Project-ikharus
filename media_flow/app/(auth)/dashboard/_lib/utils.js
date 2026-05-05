export function fmtDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function statusBadgeClass(status) {
  const map = {
    "In Progress":     "badge badge--draft",
    "Awaiting Upload": "badge badge--draft",
    "Needs Action":    "badge badge--needs-action",
    "Delivered":       "badge badge--delivered",
    "Unresolved":      "badge badge--unresolved",
  };
  return map[status] ?? "badge badge--draft";
}