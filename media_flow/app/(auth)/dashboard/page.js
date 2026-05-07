"use client";
import { useState }  from "react";
import { useUser, UserButton }   from "@clerk/nextjs";
import { useTheme } from "../../theme-provider";

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}


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
  deadline,
}) {
  return {
    id:              Date.now(),
    name,
    client,
    maxRevisions,
    projectType,                          // "video" | "image"
    deadline:        deadline ?? "",      // Added deadline field

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
  const { darkMode, toggleDarkMode } = useTheme();
  const [view, setView]                       = useState("dashboard");
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [projectToEdit, setProjectToEdit]     = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects]               = useState([]);
  const [deadlineFilter, setDeadlineFilter]   = useState(null); // Track selected project for deadline filtering

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
    if (projectToEdit) {
      // If editing, we need to handle the tasks conversion if they are strings (labels)
      const tasks = Array.isArray(formData.tasks) && typeof formData.tasks[0] === 'string'
        ? formData.tasks.map((label, i) => ({
            id:    `task_${Date.now()}_${i}`,
            label,
            done:  false,
          }))
        : formData.tasks;

      updateProject(projectToEdit.id, { ...formData, tasks });
    } else {
      setProjects((prev) => [...prev, createProject(formData)]);
    }
    setIsModalOpen(false);
    setProjectToEdit(null);
  };

  const handleEdit = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setView("dashboard");
      }
    }
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
  const filteredProjects = deadlineFilter 
    ? projects.filter(p => p.id === deadlineFilter)
    : projects;

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

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          <button
            onClick={toggleDarkMode}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-bg-surface-alt)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-medium)",
              transition: "all var(--transition-fast)",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-default)";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
            aria-label="Toggle theme"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <p style={{ 
              fontSize: "var(--text-base)", 
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1
            }}>
              Hello,{" "}
              <span style={{
                fontWeight: "var(--font-semibold)",
                color:      "var(--color-text-primary)",
              }}>
                {user?.firstName ?? "Editor"}!
              </span>
            </p>
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
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
                {filteredProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onClick={() => openProject(proj)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            <button
              className="btn--fab"
              onClick={() => setIsModalOpen(true)}
              aria-label="Create new project"
              style={{ 
                position: "absolute",
                bottom: "var(--space-8)",
                right: "var(--space-8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                lineHeight: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ display: "block" }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </section>

          {/* Upcoming Deadlines sidebar */}
          <aside className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <p className="card-section-label" style={{ margin: 0 }}>Upcoming deadlines</p>
              {deadlineFilter && (
                <button 
                  onClick={() => setDeadlineFilter(null)}
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-primary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: "var(--font-semibold)"
                  }}
                >
                  Clear filter
                </button>
              )}
            </div>

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
                {[...projects]
                  .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"))
                  .slice(0, 8)
                  .map((proj) => (
                    <DeadlineItem
                      key={proj.id}
                      project={proj}
                      isActive={deadlineFilter === proj.id}
                      onClick={() => setDeadlineFilter(proj.id)}
                    />
                  ))}
              </div>
            )}
          </aside>

        </div>
      </main>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => {
            setIsModalOpen(false);
            setProjectToEdit(null);
          }}
          onCreate={handleCreate}
          initialData={projectToEdit}
        />
      )}
    </div>
  );
}