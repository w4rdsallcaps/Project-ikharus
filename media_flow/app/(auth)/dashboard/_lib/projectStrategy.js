/**
 * _lib/progressStrategy.js
 * Strategy Pattern — interchangeable progress calculation algorithms.
 *
 * WorkLogPanel and RevisionChecklist both accept a `strategy` prop
 * so the calculation method can be swapped without touching any UI.
 *
 * Design Pattern: Strategy
 * Testing target: Unit test each function with known inputs.
 */

/**
 * Time-based strategy — used for VIDEO projects.
 * Progress = (loggedSeconds / maxSeconds) * 100, capped at 100.
 *
 * @param {number} loggedSeconds
 * @param {number} maxSeconds
 * @returns {number} 0–100
 */
export function timeBasedProgress(loggedSeconds, maxSeconds) {
  if (!maxSeconds || maxSeconds <= 0) return 0;
  return Math.min(100, Math.round((loggedSeconds / maxSeconds) * 100));
}

/**
 * Task-based strategy — used for IMAGE projects.
 * Progress = (completedTasks / totalTasks) * 100, capped at 100.
 *
 * @param {number} completedTasks
 * @param {number} totalTasks
 * @returns {number} 0–100
 */
export function taskBasedProgress(completedTasks, totalTasks) {
  if (!totalTasks || totalTasks <= 0) return 0;
  return Math.min(100, Math.round((completedTasks / totalTasks) * 100));
}

/**
 * Revision-based strategy (planned for future use).
 * Progress = (revisionsCompleted / maxRevisions) * 100, capped at 100.
 *
 * @param {number} revisionsCompleted
 * @param {number} maxRevisions
 * @returns {number} 0–100
 */
export function revisionBasedProgress(revisionsCompleted, maxRevisions) {
  if (!maxRevisions || maxRevisions <= 0) return 0;
  return Math.min(100, Math.round((revisionsCompleted / maxRevisions) * 100));
}