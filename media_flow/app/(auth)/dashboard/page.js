"use client";
import { useState }  from "react";
import { useUser }   from "@clerk/nextjs";


import ProjectCard        from "./_components/ProjectCard";
import EmptyState         from "./_components/EmptyState";
import DeadlineItem       from "./_components/DeadlineItem";
import CreateProjectModal from "./_components/CreateProjectModal";
import EditorView         from "./_components/EditorView";

// ─── Factory Pattern ──────────────────────────────────────────────────────────

function createProject({
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
    projectType,                          // "video" | "image"

    // Video fields
    maxDurationMins: maxDurationMins ?? 0,
    maxDurationSecs: maxDurationSecs ?? 0,
    loggedSeconds:   0,                   // ← persisted here, not in WorkLogPanel
    workLog:         [],                  // ← persisted here, not in WorkLogPanel

    // Image fields
    tasks: (tasks ?? []).map((label, i) => ({
      id:    `task_${Date.now()}_${i}`,
      label,
      done:  false,
    })),

    // Shared fields
    progress:  0,
    version:   "v1",
    status:    "In Progress",
    annotations: 0,
    mediaUrl:  null,
    createdAt: new Date().toISOString(),
  };
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const [view, setView]                       = useState("dashboard");
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects]               = useState([]);

  // Sync a patch to both the array AND the live selectedProject so
  // EditorView always sees the latest state without a remount.
  const updateProject = (id, patch) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    setSelectedProject((prev) =>
      prev?.id === id ? { ...prev, ...patch } : prev
    );
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = (formData) => {
    setProjects((prev) => [...prev, createProject(formData)]);
    setIsModalOpen(false);
  };

  // Called by WorkLogPanel (video) and RevisionChecklist (image).
  // `patch` can carry { loggedSeconds, workLog } from WorkLogPanel
  // or { tasks } from RevisionChecklist — both get merged into the project.
  const handleProgressUpdate = (newProgress, patch = {}) => {
    if (!selectedProject) return;
    const newStatus = newProgress >= 100 ? "Awaiting Upload" : "In Progress";
    updateProject(selectedProject.id, {
      progress: newProgress,
      status:   newStatus,
      ...patch,
    });
  };

  const handleMediaUploaded = (url) => {
    if (!selectedProject) return;
    updateProject(selectedProject.id, { mediaUrl: url, status: "Needs Action" });
    setView("dashboard");
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setView("editor");
  };

  // ── Editor view ───────────────────────────────────────────────────────────
  if (view === "editor" && selectedProject) {
    return (
      <EditorView
        project={selectedProject}
        onBack={() => setView("dashboard")}
        onProgressUpdate={handleProgressUpdate}
        onMediaUploaded={handleMediaUploaded}
      />
    );
  }

  // ── Dashboard view ────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* ── Header ── */}
      <header className="app-header">
        <a href="/" className="app-header__logo" aria-label="MediaFlow home">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="15"
              stroke="var(--color-primary)" strokeWidth="2"
              fill="var(--color-primary-glow)" />
            <path d="M13 10.5l8 5.5-8 5.5V10.5z" fill="var(--color-primary)" />
          </svg>
          <span>
            <span className="brand-media">Media</span>
            <span className="brand-flow">Flow</span>
          </span>
        </a>

        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
          Hello, {" "}
          <span style={{
            fontWeight: "var(--font-semibold)",
            color:      "var(--color-text-primary)",
          }}>
            {user?.firstName ?? "Editor"}!
          </span>
        </p>
      </header>

      {/* ── Main ── */}
      <main className="app-main">
        <div style={{
          display:             "grid",
          gridTemplateColumns: "1fr 260px",
          gap:                 "var(--space-6)",
          alignItems:          "start",
        }}>

          {/* Active Projects panel */}
          <section className="card" style={{ position: "relative", minHeight: "60vh" }}>
            <p className="card-section-label">Active projects</p>

            {projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap:                 "var(--space-5)",
              }}>
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onClick={() => openProject(proj)}
                  />
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

          {/* Upcoming Deadlines sidebar */}
          <aside className="card">
            <p className="card-section-label">Upcoming deadlines</p>

            {projects.length === 0 ? (
              <p style={{
                fontSize:  "var(--text-sm)",
                color:     "var(--color-text-muted)",
                fontStyle: "italic",
                marginTop: "var(--space-3)",
              }}>
                No upcoming deadlines.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {projects.slice(0, 5).map((proj) => (
                  <DeadlineItem
                    key={proj.id}
                    project={proj}
                    onClick={() => openProject(proj)}
                  />
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