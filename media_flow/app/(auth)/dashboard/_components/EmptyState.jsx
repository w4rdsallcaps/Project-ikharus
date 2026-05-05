/**
 * _components/EmptyState.jsx
 * Shown inside the Active Projects panel when no projects exist yet.
 */

export default function EmptyState() {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "var(--space-12) var(--space-6)",
        gap:            "var(--space-3)",
        color:          "var(--color-text-muted)",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        style={{ color: "var(--color-border-default)" }}
        aria-hidden="true"
      >
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