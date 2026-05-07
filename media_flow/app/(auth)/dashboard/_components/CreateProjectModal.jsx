"use client";
import { useState } from "react";

function fmtDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/**
 * _components/CreateProjectModal.jsx
 * Modal for creating a new project.
 * Switches between video and image fields based on projectType toggle.
 */
export default function CreateProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name:            "",
    client:          "",
    maxRevisions:    3,
    projectType:     "video",
    maxDurationMins: "",
    maxDurationSecs: "",
  });

  // Task list state for image projects
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks]         = useState([]);

  const field = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleAddTask = () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, trimmed]);
    setTaskInput("");
  };

  const handleRemoveTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      maxDurationMins: parseInt(formData.maxDurationMins) || 0,
      maxDurationSecs: parseInt(formData.maxDurationSecs) || 0,
      maxRevisions:    parseInt(formData.maxRevisions)    || 3,
      tasks,
    });
  };

  const isVideo    = formData.projectType === "video";
  const totalSecs  = (parseInt(formData.maxDurationMins) || 0) * 60
                   + (parseInt(formData.maxDurationSecs) || 0);
  const canSubmit  = isVideo ? totalSecs > 0 : tasks.length > 0;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <h2 className="modal__title" id="modal-title">New project</h2>

        <form onSubmit={handleSubmit}>

          {/* ── Project type toggle ── */}
          <div className="form-group">
            <label className="form-label">Project type</label>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>

              {/* Video button */}
              <button
                type="button"
                onClick={() => field("projectType", "video")}
                style={{
                  flex:         1,
                  padding:      "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border:       `2px solid ${isVideo ? "var(--color-primary)" : "var(--color-border-default)"}`,
                  background:   isVideo ? "var(--color-primary-glow)" : "var(--color-bg-surface-alt)",
                  color:        isVideo ? "var(--color-primary)" : "var(--color-text-secondary)",
                  fontWeight:   "var(--font-semibold)",
                  fontSize:     "var(--text-sm)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  gap:          "var(--space-2)",
                  cursor:       "pointer",
                  transition:   "all var(--transition-fast)",
                }}
              >
                {/* Video icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Video
              </button>

              {/* Image button */}
              <button
                type="button"
                onClick={() => field("projectType", "image")}
                style={{
                  flex:         1,
                  padding:      "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border:       `2px solid ${!isVideo ? "var(--color-primary)" : "var(--color-border-default)"}`,
                  background:   !isVideo ? "var(--color-primary-glow)" : "var(--color-bg-surface-alt)",
                  color:        !isVideo ? "var(--color-primary)" : "var(--color-text-secondary)",
                  fontWeight:   "var(--font-semibold)",
                  fontSize:     "var(--text-sm)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  gap:          "var(--space-2)",
                  cursor:       "pointer",
                  transition:   "all var(--transition-fast)",
                }}
              >
                {/* Image icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Image / Photo
              </button>

            </div>
          </div>

          {/* ── Project name ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">Project name</label>
            <input
              id="proj-name"
              className="form-input"
              type="text"
              required
              placeholder={isVideo ? "e.g. Wedding AVP" : "e.g. Brand Poster"}
              value={formData.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </div>

          {/* ── Client name ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="client-name">Client name</label>
            <input
              id="client-name"
              className="form-input"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.client}
              onChange={(e) => field("client", e.target.value)}
            />
          </div>

          {/* ── Max revisions ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="max-rev">Max revisions</label>
            <input
              id="max-rev"
              className="form-input"
              type="number"
              required
              min={1}
              max={20}
              value={formData.maxRevisions}
              onChange={(e) => field("maxRevisions", e.target.value)}
            />
            <span className="form-hint">How many revision rounds are included.</span>
          </div>

          {/* ── VIDEO: max work duration ── */}
          {isVideo && (
            <div className="form-group">
              <label className="form-label">Maximum work duration</label>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={formData.maxDurationMins}
                    onChange={(e) => field("maxDurationMins", e.target.value)}
                    aria-label="Minutes"
                  />
                </div>
                <span style={{
                  color: "var(--color-text-muted)",
                  fontWeight: "var(--font-semibold)",
                  fontSize: "var(--text-lg)",
                }}>:</span>
                <div style={{ flex: 1 }}>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={59}
                    placeholder="Sec"
                    value={formData.maxDurationSecs}
                    onChange={(e) => field("maxDurationSecs", e.target.value)}
                    aria-label="Seconds"
                  />
                </div>
              </div>
              <span className="form-hint">
                {totalSecs > 0
                  ? `Total: ${fmtDuration(totalSecs)}. Editor logs work until 100%.`
                  : "How long this edit takes. Unlocks upload when 100% is reached."}
              </span>
            </div>
          )}

          {/* ── IMAGE: revision checklist tasks ── */}
          {!isVideo && (
            <div className="form-group">
              <label className="form-label">Checklist</label>
              <span className="form-hint" style={{ marginBottom: "var(--space-2)", display: "block" }}>
                Add tasks the editor must complete before uploading the final image.
              </span>

              {/* Add task input */}
              <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Color grading"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTask())}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleAddTask}
                  style={{ height: 40, paddingLeft: "var(--space-4)", paddingRight: "var(--space-4)" }}
                >
                  Add
                </button>
              </div>

              {/* Task list */}
              {tasks.length === 0 ? (
                <p style={{
                  fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
                  fontStyle: "italic", textAlign: "center", padding: "var(--space-3)",
                  background: "var(--color-bg-surface-alt)", borderRadius: "var(--radius-md)",
                }}>
                  No tasks yet. Add at least one to proceed.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {tasks.map((task, i) => (
                    <div key={i} style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "var(--space-2) var(--space-3)",
                      background:     "var(--color-bg-surface-alt)",
                      borderRadius:   "var(--radius-md)",
                      border:         "1px solid var(--color-border-default)",
                    }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>
                        {i + 1}. {task}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(i)}
                        style={{
                          color:    "var(--color-text-muted)",
                          fontSize: "var(--text-lg)",
                          lineHeight: 1,
                          cursor:   "pointer",
                          padding:  "0 var(--space-1)",
                        }}
                        aria-label={`Remove task: ${task}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!canSubmit}
              style={{
                opacity: !canSubmit ? 0.5 : 1,
                cursor:  !canSubmit ? "not-allowed" : "pointer",
              }}
            >
              Create project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}