/**
 * _lib/projectFactory.js
 * Factory Pattern — single source of truth for the Project object schema.
 *
 * Design Pattern: Factory
 * Testing target: Unit test — assert all fields are present and correctly typed.
 */

/**
 * Create a new Project object.
 *
 * @param {{
 *   name:            string,
 *   client:          string,
 *   maxRevisions:    number,
 *   projectType:     "video" | "image",
 *   maxDurationMins: number,   // video only
 *   maxDurationSecs: number,   // video only
 *   tasks:           string[], // image only — custom checklist items
 * }} params
 * @returns {Project}
 */
export function createProject({
  name,
  client,
  maxRevisions,
  projectType,
  maxDurationMins,
  maxDurationSecs,
  tasks,
}) {
  return {
    id:              Date.now(),
    name,
    client,
    maxRevisions,
    projectType,                         // "video" | "image"

    // Video-only fields
    maxDurationMins: maxDurationMins ?? 0,
    maxDurationSecs: maxDurationSecs ?? 0,

    // Image-only fields
    // Each task: { id, label, done }
    tasks: (tasks ?? []).map((label, i) => ({
      id:    `task_${Date.now()}_${i}`,
      label,
      done:  false,
    })),

    // Shared fields
    progress:    0,           // 0–100, driven by WorkLogPanel or RevisionChecklist
    version:     "v1",
    status:      "In Progress",
    annotations: 0,
    mediaUrl:    null,        // replaces videoUrl — works for both video and image
    createdAt:   new Date().toISOString(),
  };
}