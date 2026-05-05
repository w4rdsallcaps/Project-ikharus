"use client";
//full-page editor view shown when the editor opens a project.
// Decorator Pattern (planned): the <video> element will be wrapped with
// a transparent <canvas> layer here for the annotation draw tools.



import { useState }          from "react";
import { CldUploadWidget }   from "next-cloudinary";

import ProgressRing          from "./ProgressRing";
import WorkLogPanel          from "./WorkLogPanel";
import { statusBadgeClass }  from "../_lib/utils";

/**
 * @param {{
 *   project:          Project,
 *   onBack:           () => void,
 *   onProgressUpdate: (progress: number) => void,
 *   onVideoUploaded:  (url: string) => void,
 * }} props
 */
export default function EditorView({
  project,
  onBack,
  onProgressUpdate,
  onVideoUploaded,
}) {
  const isReadyToUpload = project.progress >= 100;
  const [tokenSent, setTokenSent] = useState(false);

  const handleSendToken = () => {
    // TODO: Replace with real Firestore token doc creation + shareable link delivery.
    // The token will become the client's review page URL key.
    const token = `mf_${project.id}_${Math.random().toString(36).slice(2, 10)}`;
    console.log("[MediaFlow] Client review token generated:", token);
    setTokenSent(true);
  };

  return (
    <div className="app-shell">

      {/* ── Header ── */}
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <button
            className="btn btn--ghost"
            onClick={onBack}
            style={{ fontSize: "var(--text-sm)" }}
          >
            ← Back
          </button>

          <span
            style={{
              fontWeight: "var(--font-semibold)",
              color:      "var(--color-text-primary)",
              fontSize:   "var(--text-lg)",
            }}
          >
            {project.name}
          </span>

          <span className={statusBadgeClass(project.status)}>
            {project.status}
          </span>
        </div>

        {/* Linear header progress bar */}
        <div
          className="header-progress"
          style={{ flex: 1, maxWidth: 300, margin: "0 var(--space-8)" }}
        >
          <div className="header-progress__bar">
            <div
              className="header-progress__fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="header-progress__pct">{project.progress}%</span>
        </div>

        <div
          style={{
            fontSize:      "var(--text-xs)",
            color:         "var(--color-text-secondary)",
            fontWeight:    "var(--font-semibold)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Revisions: 0 / {project.maxRevisions}
        </div>
      </header>

      {/* ── Body ── */}
      <main className="app-main">
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 320px",
            gap:                 "var(--space-6)",
            alignItems:          "start",
          }}
        >

          {/* ── Left: video / upload zone ── */}
          <div>
            <div
              className="card"
              style={{
                padding:      0,
                overflow:     "hidden",
                minHeight:    "55vh",
                marginBottom: "var(--space-4)",
              }}
            >
              {!project.videoUrl ? (
                isReadyToUpload ? (

                  /* Work log complete — upload widget is unlocked */
                  <CldUploadWidget
                    uploadPreset="mediaflow_unsigned"
                    onSuccess={(res) => onVideoUploaded(res.info.secure_url)}
                  >
                    {({ open }) => (
                      <button
                        onClick={() => open()}
                        style={{
                          width:          "100%",
                          height:         "100%",
                          minHeight:      "55vh",
                          display:        "flex",
                          flexDirection:  "column",
                          alignItems:     "center",
                          justifyContent: "center",
                          gap:            "var(--space-4)",
                          background:     "var(--color-primary-glow)",
                          border:         "2px dashed var(--color-primary)",
                          borderRadius:   "var(--radius-xl)",
                          cursor:         "pointer",
                          transition:     "background var(--transition-fast)",
                        }}
                        onMouseEnter={(e) =>
                          e.currentTarget.style.background = "rgba(45,156,219,0.22)"
                        }
                        onMouseLeave={(e) =>
                          e.currentTarget.style.background = "var(--color-primary-glow)"
                        }
                      >
                        {/* Upload icon */}
                        <div
                          style={{
                            width:          72,
                            height:         72,
                            borderRadius:   "var(--radius-full)",
                            background:     "var(--color-primary)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            color:          "#fff",
                          }}
                        >
                          <svg
                            width="32" height="32" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                          >
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="14" />
                          </svg>
                        </div>

                        <div style={{ textAlign: "center" }}>
                          <p
                            style={{
                              fontWeight: "var(--font-semibold)",
                              color:      "var(--color-primary)",
                              fontSize:   "var(--text-lg)",
                            }}
                          >
                            Upload v1 draft
                          </p>
                          <p
                            style={{
                              fontSize:   "var(--text-sm)",
                              color:      "var(--color-text-muted)",
                              marginTop:  "var(--space-1)",
                            }}
                          >
                            Work log complete — MP4 supported
                          </p>
                        </div>
                      </button>
                    )}
                  </CldUploadWidget>

                ) : (

                  /* Work log incomplete — upload is locked */
                  <div
                    style={{
                      width:          "100%",
                      minHeight:      "55vh",
                      display:        "flex",
                      flexDirection:  "column",
                      alignItems:     "center",
                      justifyContent: "center",
                      gap:            "var(--space-5)",
                      background:     "var(--color-bg-surface-alt)",
                      border:         "2px dashed var(--color-border-default)",
                      borderRadius:   "var(--radius-xl)",
                    }}
                  >
                    {/* Lock icon */}
                    <div
                      style={{
                        width:          64,
                        height:         64,
                        borderRadius:   "var(--radius-full)",
                        background:     "var(--color-border-default)",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          "var(--color-text-muted)",
                      }}
                    >
                      <svg
                        width="28" height="28" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontWeight: "var(--font-semibold)",
                          color:      "var(--color-text-secondary)",
                          fontSize:   "var(--text-base)",
                        }}
                      >
                        Upload locked
                      </p>
                      <p
                        style={{
                          fontSize:  "var(--text-sm)",
                          color:     "var(--color-text-muted)",
                          marginTop: "var(--space-1)",
                        }}
                      >
                        Complete your work log to reach 100%
                      </p>
                    </div>

                    {/* Inline progress hint pill */}
                    <div
                      style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "var(--space-3)",
                        background:   "var(--color-bg-surface)",
                        border:       "1px solid var(--color-border-default)",
                        borderRadius: "var(--radius-lg)",
                        padding:      "var(--space-3) var(--space-5)",
                      }}
                    >
                      <div style={{ position: "relative", width: 40, height: 40 }}>
                        <ProgressRing progress={project.progress} size={40} stroke={3} />
                        <span
                          style={{
                            position:       "absolute",
                            inset:          0,
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            fontSize:       "9px",
                            fontWeight:     "bold",
                            color:          "var(--color-text-primary)",
                          }}
                        >
                          {project.progress}%
                        </span>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize:   "var(--text-sm)",
                            fontWeight: "var(--font-medium)",
                            color:      "var(--color-text-primary)",
                          }}
                        >
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
                /*
                 * TODO — Decorator Pattern:
                 * Wrap <video> with a transparent <canvas> overlay here
                 * for the "Encircle" annotation draw tool.
                 */
                <video
                  src={project.videoUrl}
                  controls
                  style={{
                    width:        "100%",
                    height:       "100%",
                    objectFit:    "contain",
                    background:   "#000",
                    borderRadius: "var(--radius-xl)",
                  }}
                />
              )}
            </div>

            {/* ── Action buttons — visible once work log is complete ── */}
            {isReadyToUpload && (
              <div
                style={{
                  display:    "flex",
                  gap:        "var(--space-3)",
                  flexWrap:   "wrap",
                  alignItems: "center",
                }}
              >
                {/* Send client token — temporary placeholder */}
                <button
                  className={tokenSent ? "btn btn--ghost" : "btn btn--secondary"}
                  onClick={handleSendToken}
                  disabled={tokenSent}
                  style={{
                    opacity: tokenSent ? 0.65 : 1,
                    cursor:  tokenSent ? "default" : "pointer",
                  }}
                >
                  <svg
                    width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  {tokenSent ? "Token sent ✓" : "Send client token"}
                </button>

                {project.videoUrl && (
                  <span
                    className="badge badge--delivered"
                    style={{ padding: "var(--space-2) var(--space-4)" }}
                  >
                    v1 uploaded ✓
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: work log panel or annotation sidebar ── */}
          <aside>
            {!project.videoUrl ? (
              <WorkLogPanel
                project={project}
                onProgressUpdate={onProgressUpdate}
                // strategy={revisionBasedProgress} ← swap strategy here when needed
              />
            ) : (
              /* TODO: Replace with real AnnotationSidebar component (Observer Pattern) */
              <div className="card">
                <p className="card-section-label">Annotations</p>
                <div
                  style={{
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    height:         200,
                    color:          "var(--color-text-muted)",
                    fontSize:       "var(--text-sm)",
                    fontStyle:      "italic",
                  }}
                >
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