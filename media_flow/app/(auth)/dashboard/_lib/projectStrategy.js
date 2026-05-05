export function timeBasedProgress(loggedSeconds, maxSeconds) {
  if (!maxSeconds || maxSeconds <= 0) return 0;
  return Math.min(100, Math.round((loggedSeconds / maxSeconds) * 100));
}

export function revisionBasedProgress(revisionsCompleted, maxRevisions) {
  if (!maxRevisions || maxRevisions <= 0) return 0;
  return Math.min(100, Math.round((revisionsCompleted / maxRevisions) * 100));
}