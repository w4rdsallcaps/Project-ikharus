/**
 * _lib/projectFactory.js
 * factory pattern
 *
 * Every project in MediaFlow is created through this factory.
 */

/**
 * Create a new Project object.
 *
 * @param {{
 *   name: string,
 *   client: string,
 *   maxRevisions: number,
 *   maxDurationMins: number,
 *   maxDurationSecs: number,
 * }} params
 * @returns {Project}
 */
export function createProject({ name, client, maxRevisions, maxDurationMins, maxDurationSecs }) {
  return {
    id:              Date.now(),        // replace with uuid or Firestore doc ID later
    name,
    client,
    maxRevisions,
    maxDurationMins,                   // progress target — minutes portion
    maxDurationSecs,                   // progress target — seconds portion
    progress:        0,                // 0–100, driven by WorkLogPanel
    version:         "v1",
    status:          "In Progress",
    annotations:     0,
    videoUrl:        null,
    createdAt:       new Date().toISOString(),
  };
}