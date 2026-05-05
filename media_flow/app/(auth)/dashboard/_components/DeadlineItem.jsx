//a single row in the Upcoming Deadlines sidebar.
/**
 * @param {{ project: Project, onClick: () => void }} props
 */
export default function DeadlineItem({ project, onClick }) {
  return (
    <div
      className="deadline-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open ${project.name}`}
    >
      <div className="deadline-item__icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 2.5l8 4.5-8 4.5V2.5z" />
        </svg>
      </div>

      <div>
        <p className="deadline-item__name truncate" style={{ maxWidth: 160 }}>
          {project.name}
        </p>
        <p className="deadline-item__date">
          {project.version} · {project.status}
        </p>
      </div>
    </div>
  );
}