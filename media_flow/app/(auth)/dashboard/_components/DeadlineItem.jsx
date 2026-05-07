//a single row in the Upcoming Deadlines sidebar.
/**
 * @param {{ project: Project, onClick: () => void }} props
 */
export default function DeadlineItem({ project, onClick, isActive }) {
  const dateStr = project.deadline 
    ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : "No date";

  return (
    <div
      className={`deadline-item ${isActive ? 'deadline-item--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Filter by ${project.name} deadline`}
      style={{
        background: isActive ? "var(--color-primary-glow)" : "transparent",
        border: isActive ? "1px solid var(--color-primary)" : "1px solid transparent",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2)",
        transition: "all var(--transition-fast)",
      }}
    >
      <div className="deadline-item__icon" aria-hidden="true" style={{ color: isActive ? "var(--color-primary)" : "var(--color-text-muted)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 2.5l8 4.5-8 4.5V2.5z" />
        </svg>
      </div>

      <div>
        <p className="deadline-item__name truncate" style={{ 
          maxWidth: 160,
          color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
          fontWeight: isActive ? "var(--font-bold)" : "var(--font-medium)"
        }}>
          {project.name}
        </p>
        <p className="deadline-item__date" style={{ color: isActive ? "var(--color-primary)" : "var(--color-text-muted)" }}>
          {dateStr} · {project.status}
        </p>
      </div>
    </div>
  );
}