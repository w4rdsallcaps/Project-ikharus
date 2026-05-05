//single project tile displayed in the Active Projects grid.

import ProgressRing from "./ProgressRing";
import { statusBadgeClass } from "../_lib/utils";

/** Film-strip SVG used when no video thumbnail is available. */
function FilmPlaceholder() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      style={{ color: "var(--color-border-default)" }}
    >
      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
    </svg>
  );
}

/**
 * @param {{ project: Project, onClick: () => void }} props
 */
export default function ProjectCard({ project, onClick }) {
  return (
    <article
      className="card-tile"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open project ${project.name}`}
    >
      {/* ── Thumbnail ── */}
      <div className="project-card__thumbnail">
        {project.videoUrl ? (
          <img
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${
              project.videoUrl.split("/upload/")[1]?.replace(/\.[^.]+$/, ".jpg")
            }`}
            alt={`${project.name} thumbnail`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div
            style={{
              width:           "100%",
              height:          "100%",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              background:      "var(--color-bg-surface-alt)",
            }}
          >
            <FilmPlaceholder />
          </div>
        )}

        {/* Progress ring — top-right corner of the thumbnail */}
        <div className="project-card__progress">
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <ProgressRing progress={project.progress} size={52} />
            <span
              style={{
                position:       "absolute",
                inset:          0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "var(--text-xs)",
                fontWeight:     "var(--font-bold)",
                color:          "var(--color-text-primary)",
              }}
            >
              {project.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="project-card__meta">
        <h3 className="project-card__name">{project.name}</h3>
        <p className="project-card__client">Client: {project.client}</p>

        {project.annotations > 0 && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Annotations: {project.annotations}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="project-card__footer">
        <span className={statusBadgeClass(project.status)}>{project.status}</span>
        <span className="version-label">{project.version}</span>
      </div>
    </article>
  );
}