"use client";
//creating a new project (Project Factory entry point)
//collects: name, client, max revisions, max work duration


import { useState } from "react";
import { fmtDuration } from "../_lib/utils";

/**
 * @param {{
 *   onClose: () => void,
 *   onCreate: (formData: object) => void,
 * }} props
 */
export default function CreateProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name:            "",
    client:          "",
    maxRevisions:    3,
    maxDurationMins: "",
    maxDurationSecs: "",
  });

  const field = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      maxDurationMins: parseInt(formData.maxDurationMins) || 0,
      maxDurationSecs: parseInt(formData.maxDurationSecs) || 0,
      maxRevisions:    parseInt(formData.maxRevisions)    || 3,
    });
  };

  const totalSecs =
    (parseInt(formData.maxDurationMins) || 0) * 60 +
    (parseInt(formData.maxDurationSecs) || 0);

  const durationPreview = totalSecs > 0 ? fmtDuration(totalSecs) : null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <h2 className="modal__title" id="modal-title">
          New project
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Project name */}
          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">
              Project name
            </label>
            <input
              id="proj-name"
              className="form-input"
              type="text"
              required
              placeholder="e.g. Wedding AVP"
              value={formData.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </div>

          {/* Client name */}
          <div className="form-group">
            <label className="form-label" htmlFor="client-name">
              Client name
            </label>
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

          {/* Max revisions */}
          <div className="form-group">
            <label className="form-label" htmlFor="max-rev">
              Max revisions
            </label>
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

          {/* Maximum work duration */}
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
              <span
                style={{
                  color:      "var(--color-text-muted)",
                  fontWeight: "var(--font-semibold)",
                  fontSize:   "var(--text-lg)",
                }}
              >
                :
              </span>
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
              {durationPreview
                ? `Total: ${durationPreview}. Editor logs work sessions until 100%.`
                : "How long this edit takes. Editor logs work until 100% to unlock upload."}
            </span>
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={totalSecs === 0}
              style={{
                opacity: totalSecs === 0 ? 0.5 : 1,
                cursor:  totalSecs === 0 ? "not-allowed" : "pointer",
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