"use client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";


/** Convert total seconds → "Xm Ys" display string */
function fmtDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));


function ProgressRing({ progress = 0, size = 52, stroke = 4 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(progress, 0, 100) / 100) * circ;
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

function statusBadge(status) {
  const map = {
    "In Progress":     "badge badge--draft",
    "Awaiting Upload": "badge badge--draft",
    "Needs Action":    "badge badge--needs-action",
    "Delivered":       "badge badge--delivered",
    "Unresolved":      "badge badge--unresolved",
  };
  return map[status] ?? "badge badge--draft";
}

function FilmPlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor"
      aria-hidden="true" style={{ color: "var(--color-border-default)" }}>
      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
    </svg>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }) {
  return (
    <article
      className="card-tile"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open project ${project.name}`}
    >
      <div className="project-card__thumbnail">
        {project.videoUrl ? (
          <img
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${project.videoUrl.split("/upload/")[1]?.replace(/\.[^.]+$/, ".jpg")}`}
            alt={`${project.name} thumbnail`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-surface-alt)",
          }}>
            <FilmPlaceholder />
          </div>
        )}

        {/* Progress ring — top-right */}
        <div className="project-card__progress">
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <ProgressRing progress={project.progress} size={52} />
            <span style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--text-xs)", fontWeight: "var(--font-bold)",
              color: "var(--color-text-primary)",
            }}>
              {project.progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="project-card__meta">
        <h3 className="project-card__name">{project.name}</h3>
        <p className="project-card__client">Client: {project.client}</p>
        {project.annotations > 0 && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Annotations: {project.annotations}
          </p>
        )}
      </div>

      <div className="project-card__footer">
        <span className={statusBadge(project.status)}>{project.status}</span>
        <span className="version-label">{project.version}</span>
      </div>
    </article>
  );
}

// ─── Work Log Panel ───────────────────────────────────────────────────────────
//
// Strategy Pattern note: `calcProgress` is the isolated calculation strategy.
// Swap it out (e.g. revision-based, milestone-based) without touching EditorView.

function calcProgress(loggedSeconds, maxSeconds) {
  if (!maxSeconds || maxSeconds <= 0) return 0;
  return Math.min(100, Math.round((loggedSeconds / maxSeconds) * 100));
}

function WorkLogPanel({ project, onProgressUpdate }) {
  const [mins, setMins] = useState("");
  const [secs, setSecs] = useState("");
  const [log, setLog]   = useState([]);
  const [totalLogged, setTotalLogged] = useState(0);

  const maxSeconds = (project.maxDurationMins * 60) + (project.maxDurationSecs ?? 0);
  const progress   = calcProgress(totalLogged, maxSeconds);
  const isComplete = progress >= 100;

  const handleAddEntry = () => {
    const m     = parseInt(mins) || 0;
    const s     = parseInt(secs) || 0;
    const added = m * 60 + s;
    if (added <= 0) return;

    const newTotal    = Math.min(totalLogged + added, maxSeconds);
    const newProgress = calcProgress(newTotal, maxSeconds);

    const entry = {
      id:        Date.now(),
      label:     fmtDuration(added),
      seconds:   added,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setLog((prev) => [entry, ...prev]);
    setTotalLogged(newTotal);
    onProgressUpdate(newProgress);
    setMins("");
    setSecs("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

      {/* Progress summary card */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: "var(--space-3)",
        }}>
          <p className="card-section-label" style={{ margin: 0 }}>Work progress</p>
          <span style={{
            fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)",
            color: isComplete ? "var(--color-status-delivered-text)" : "var(--color-primary)",
          }}>
            {fmtDuration(Math.min(totalLogged, maxSeconds))} / {fmtDuration(maxSeconds)}
          </span>
        </div>

        <div className="header-progress__bar">
          <div
            className="header-progress__fill"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? "var(--color-status-delivered-text)"
                : "var(--color-primary)",
            }}
          />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: "var(--space-2)",
          fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
        }}>
          <span>{log.length} {log.length === 1 ? "entry" : "entries"} logged</span>
          <span style={{
            fontWeight: "var(--font-semibold)",
            color: isComplete ? "var(--color-status-delivered-text)" : "var(--color-text-secondary)",
          }}>
            {progress}%{isComplete && " — Ready to upload ✓"}
          </span>
        </div>
      </div>

      {/* Add entry form */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <p className="card-section-label">Log work session</p>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="log-mins">Minutes</label>
            <input
              id="log-mins"
              className="form-input"
              type="number"
              min={0}
              placeholder="0"
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
            />
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="log-secs">Seconds</label>
            <input
              id="log-secs"
              className="form-input"
              type="number"
              min={0}
              max={59}
              placeholder="0"
              value={secs}
              onChange={(e) => setSecs(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
            />
          </div>

          <button
            className="btn btn--primary"
            onClick={handleAddEntry}
            disabled={isComplete}
            style={{
              height: 40,
              paddingLeft: "var(--space-5)", paddingRight: "var(--space-5)",
              opacity: isComplete ? 0.4 : 1,
              cursor: isComplete ? "not-allowed" : "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Session history */}
      {log.length > 0 && (
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <p className="card-section-label">Session history</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {log.map((entry) => (
              <div key={entry.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg-surface-alt)",
                borderRadius: "var(--radius-md)",
              }}>
                <span style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-medium)",
                  color: "var(--color-text-primary)",
                }}>
                  + {entry.label}
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editor View ──────────────────────────────────────────────────────────────

function EditorView({ project, onBack, onProgressUpdate, onVideoUploaded }) {
  const isReadyToUpload = project.progress >= 100;
  const [tokenSent, setTokenSent] = useState(false);

  const handleSendToken = () => {
    // TODO: replace with real Firestore token doc + email/link delivery
    const token = `mf_${project.id}_${Math.random().toString(36).slice(2, 10)}`;
    console.log("[MediaFlow] Client review token:", token);
    setTokenSent(true);
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <button className="btn btn--ghost" onClick={onBack} style={{ fontSize: "var(--text-sm)" }}>
            ← Back
          </button>
          <span style={{
            fontWeight: "var(--font-semibold)",
            color: "var(--color-text-primary)",
            fontSize: "var(--text-lg)",
          }}>
            {project.name}
          </span>
          <span className={statusBadge(project.status)}>{project.status}</span>
        </div>

        {/* Linear progress bar in the header */}
        <div className="header-progress" style={{ flex: 1, maxWidth: 300, margin: "0 var(--space-8)" }}>
          <div className="header-progress__bar">
            <div className="header-progress__fill" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="header-progress__pct">{project.progress}%</span>
        </div>

        <div style={{
          fontSize: "var(--text-xs)", color: "var(--color-text-secondary)",
          fontWeight: "var(--font-semibold)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Revisions: 0 / {project.maxRevisions}
        </div>
      </header>

      {/* Body */}
      <main className="app-main">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "var(--space-6)",
          alignItems: "start",
        }}>

          {/* ── Left: video area ── */}
          <div>
            <div className="card" style={{
              padding: 0, overflow: "hidden",
              minHeight: "55vh", marginBottom: "var(--space-4)",
            }}>
              {!project.videoUrl ? (
                isReadyToUpload ? (
                  /* 100% logged — real upload widget is unlocked */
                  <CldUploadWidget
                    uploadPreset="mediaflow_unsigned"
                    onSuccess={(res) => onVideoUploaded(res.info.secure_url)}
                  >
                    {({ open }) => (
                      <button
                        onClick={() => open()}
                        style={{
                          width: "100%", height: "100%", minHeight: "55vh",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          gap: "var(--space-4)",
                          background: "var(--color-primary-glow)",
                          border: "2px dashed var(--color-primary)",
                          borderRadius: "var(--radius-xl)",
                          cursor: "pointer",
                          transition: "background var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(45,156,219,0.22)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-primary-glow)"}
                      >
                        <div style={{
                          width: 72, height: 72, borderRadius: "var(--radius-full)",
                          background: "var(--color-primary)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff",
                        }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="14" />
                          </svg>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{
                            fontWeight: "var(--font-semibold)",
                            color: "var(--color-primary)",
                            fontSize: "var(--text-lg)",
                          }}>
                            Upload v1 draft
                          </p>
                          <p style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-muted)",
                            marginTop: "var(--space-1)",
                          }}>
                            Work log complete — MP4 supported
                          </p>
                        </div>
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  /* < 100% — upload is locked */
                  <div style={{
                    width: "100%", minHeight: "55vh",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: "var(--space-5)",
                    background: "var(--color-bg-surface-alt)",
                    border: "2px dashed var(--color-border-default)",
                    borderRadius: "var(--radius-xl)",
                  }}>
                    {/* Lock icon */}
                    <div style={{
                      width: 64, height: 64, borderRadius: "var(--radius-full)",
                      background: "var(--color-border-default)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--color-text-muted)",
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p style={{
                        fontWeight: "var(--font-semibold)",
                        color: "var(--color-text-secondary)",
                        fontSize: "var(--text-base)",
                      }}>
                        Upload locked
                      </p>
                      <p style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-muted)",
                        marginTop: "var(--space-1)",
                      }}>
                        Complete your work log to reach 100%
                      </p>
                    </div>

                    {/* Inline progress hint pill */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "var(--space-3)",
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-3) var(--space-5)",
                    }}>
                      <div style={{ position: "relative", width: 40, height: 40 }}>
                        <ProgressRing progress={project.progress} size={40} stroke={3} />
                        <span style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "9px", fontWeight: "bold",
                          color: "var(--color-text-primary)",
                        }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div>
                        <p style={{
                          fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)",
                          color: "var(--color-text-primary)",
                        }}>
                          {project.progress}% logged
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                          Log more work on the right →
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Video uploaded — show player */
                <video
                  src={project.videoUrl}
                  controls
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "contain", background: "#000",
                    borderRadius: "var(--radius-xl)",
                  }}
                />
              )}
            </div>

            {/* Action buttons row — visible once work is complete */}
            {isReadyToUpload && (
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>

                {/* Send Client Token — temporary placeholder button */}
                <button
                  className={tokenSent ? "btn btn--ghost" : "btn btn--secondary"}
                  onClick={handleSendToken}
                  disabled={tokenSent}
                  style={{
                    opacity: tokenSent ? 0.65 : 1,
                    cursor: tokenSent ? "default" : "pointer",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  {tokenSent ? "Token sent ✓" : "Send client token"}
                </button>

                {project.videoUrl && (
                  <span className="badge badge--delivered"
                    style={{ padding: "var(--space-2) var(--space-4)" }}>
                    v1 uploaded ✓
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: work log or annotation panel ── */}
          <aside>
            {!project.videoUrl ? (
              <WorkLogPanel
                project={project}
                onProgressUpdate={onProgressUpdate}
              />
            ) : (
              <div className="card">
                <p className="card-section-label">Annotations</p>
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: 200,
                  color: "var(--color-text-muted)",
                  fontSize: "var(--text-sm)", fontStyle: "italic",
                }}>
                  No feedback yet.
                </div>
              </div>
            )}
          </aside>

        </div>
      </main>
    </div>
  );
}

// ─── Create Project Modal ─────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name:             "",
    client:           "",
    maxRevisions:     3,
    maxDurationMins:  "",
    maxDurationSecs:  "",
  });

  const field = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      maxDurationMins: parseInt(formData.maxDurationMins) || 0,
      maxDurationSecs: parseInt(formData.maxDurationSecs) || 0,
      maxRevisions:    parseInt(formData.maxRevisions)    || 3,
    });
  };

  const totalSecs = (parseInt(formData.maxDurationMins) || 0) * 60
                  + (parseInt(formData.maxDurationSecs)  || 0);
  const durationPreview = totalSecs > 0 ? fmtDuration(totalSecs) : null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 className="modal__title" id="modal-title">New project</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">Project name</label>
            <input id="proj-name" className="form-input" type="text" required
              placeholder="e.g. Wedding AVP"
              value={formData.name}
              onChange={(e) => field("name", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-name">Client name</label>
            <input id="client-name" className="form-input" type="text" required
              placeholder="e.g. John Doe"
              value={formData.client}
              onChange={(e) => field("client", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="max-rev">Max revisions</label>
            <input id="max-rev" className="form-input" type="number" required
              min={1} max={20}
              value={formData.maxRevisions}
              onChange={(e) => field("maxRevisions", e.target.value)} />
            <span className="form-hint">How many revision rounds are included.</span>
          </div>

          {/* Max work duration — sets the 100% target for the work log */}
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
              }}>
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
            <button type="button" className="btn btn--ghost" onClick={onClose}>
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "var(--space-12) var(--space-6)",
      gap: "var(--space-3)", color: "var(--color-text-muted)",
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.2" style={{ color: "var(--color-border-default)" }} aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M10 9l5 3-5 3V9z" />
      </svg>
      <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-medium)" }}>
        No projects yet
      </p>
      <p style={{ fontSize: "var(--text-sm)" }}>
        Tap the{" "}
        <strong style={{ color: "var(--color-primary)" }}>+</strong>
        {" "}button to create your first project.
      </p>
    </div>
  );
}

// ─── Root Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [view, setView]                       = useState("dashboard");
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects]               = useState([]);

  //factory Pattern
  const createProject = ({ name, client, maxRevisions, maxDurationMins, maxDurationSecs }) => ({
    id:              Date.now(),
    name,
    client,
    maxRevisions,
    maxDurationMins,  // progress target (minutes portion)
    maxDurationSecs,  // progress target (seconds portion)
    progress:        0,
    version:         "v1",
    status:          "In Progress",
    annotations:     0,
    videoUrl:        null,
    createdAt:       new Date().toISOString(),
  });

  // Sync a patch to both the projects array and the live selectedProject
  const updateProject = (id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSelectedProject((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  };

  const handleCreate = (formData) => {
    setProjects((prev) => [...prev, createProject(formData)]);
    setIsModalOpen(false);
  };

  const handleProgressUpdate = (newProgress) => {
    if (!selectedProject) return;
    const newStatus = newProgress >= 100 ? "Awaiting Upload" : "In Progress";
    updateProject(selectedProject.id, { progress: newProgress, status: newStatus });
  };

  const handleVideoUploaded = (url) => {
    if (!selectedProject) return;
    updateProject(selectedProject.id, { videoUrl: url, status: "Needs Action" });
    setView("dashboard"); // return to dashboard — card now shows the thumbnail
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setView("editor");
  };

  // ── Editor view ──────────────────────────────────────────────────
  if (view === "editor" && selectedProject) {
    return (
      <EditorView
        project={selectedProject}
        onBack={() => setView("dashboard")}
        onProgressUpdate={handleProgressUpdate}
        onVideoUploaded={handleVideoUploaded}
      />
    );
  }

  // ── Dashboard view ───────────────────────────────────────────────
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="/" className="app-header__logo" aria-label="MediaFlow home">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="15" stroke="var(--color-primary)" strokeWidth="2"
              fill="var(--color-primary-glow)" />
            <path d="M13 10.5l8 5.5-8 5.5V10.5z" fill="var(--color-primary)" />
          </svg>
          <span>
            <span className="brand-media">Media</span>
            <span className="brand-flow">Flow</span>
          </span>
        </a>

        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
          Hello,{" "}
          <span style={{ fontWeight: "var(--font-semibold)", color: "var(--color-text-primary)" }}>
            Editor!
          </span>
        </p>
      </header>

      <main className="app-main">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px",
          gap: "var(--space-6)",
          alignItems: "start",
        }}>
          <section className="card" style={{ position: "relative", minHeight: "60vh" }}>
            <p className="card-section-label">Active projects</p>

            {projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "var(--space-5)",
              }}>
                {projects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} onClick={() => openProject(proj)} />
                ))}
              </div>
            )}

            <button
              className="btn--fab"
              onClick={() => setIsModalOpen(true)}
              aria-label="Create new project"
              style={{ position: "absolute" }}
            >
              +
            </button>
          </section>

          <aside className="card">
            <p className="card-section-label">Upcoming deadlines</p>
            {projects.length === 0 ? (
              <p style={{
                fontSize: "var(--text-sm)", color: "var(--color-text-muted)",
                fontStyle: "italic", marginTop: "var(--space-3)",
              }}>
                No upcoming deadlines.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {projects.slice(0, 5).map((proj) => (
                  <div
                    key={proj.id}
                    className="deadline-item"
                    onClick={() => openProject(proj)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openProject(proj)}
                  >
                    <div className="deadline-item__icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <path d="M3 2.5l8 4.5-8 4.5V2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="deadline-item__name truncate" style={{ maxWidth: 160 }}>
                        {proj.name}
                      </p>
                      <p className="deadline-item__date">{proj.version} · {proj.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}