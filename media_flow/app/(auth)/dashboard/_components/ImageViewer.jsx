"use client";
/**
 * _components/ImageViewer.jsx
 * Image viewer with draggable ellipse annotation tool.
 *
 * Design Pattern: Decorator — the <img> is decorated with a <canvas>
 * overlay that handles ellipse drawing without touching the image itself.
 *
 * How it works:
 *  - User clicks "Add Annotation" to enter draw mode
 *  - On the canvas, mousedown starts an ellipse, mousemove resizes it,
 *    mouseup finalizes it and prompts for a comment
 *  - Each ellipse is stored in local state and re-drawn on every render
 *  - Clicking an existing ellipse selects it and shows its comment
 */

import { useState, useRef, useEffect, useCallback } from "react";

const ELLIPSE_COLOR         = "#7C3AED";
const ELLIPSE_COLOR_ACTIVE  = "#2D9CDB";
const ELLIPSE_ALPHA         = 0.18;
const ELLIPSE_STROKE        = 2.5;

export default function ImageViewer({ project, onAnnotationAdd }) {
  const canvasRef        = useRef(null);
  const imgRef           = useRef(null);
  const [drawMode, setDrawMode]       = useState(false);
  const [drawing, setDrawing]         = useState(false);
  const [startPos, setStartPos]       = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState(null);
  const [ellipses, setEllipses]       = useState([]);
  const [selected, setSelected]       = useState(null);   // index of selected ellipse
  const [pendingRect, setPendingRect] = useState(null);   // rect awaiting comment
  const [comment, setComment]         = useState("");
  const [imgLoaded, setImgLoaded]     = useState(false);

  // ── Re-draw all ellipses whenever they change ──────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    canvas.width  = img.clientWidth;
    canvas.height = img.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved ellipses
    ellipses.forEach((el, i) => {
      const isSelected = i === selected;
      ctx.beginPath();
      ctx.ellipse(
        el.cx, el.cy, el.rx, el.ry, 0, 0, 2 * Math.PI
      );
      ctx.strokeStyle = isSelected ? ELLIPSE_COLOR_ACTIVE : ELLIPSE_COLOR;
      ctx.lineWidth   = isSelected ? ELLIPSE_STROKE + 1 : ELLIPSE_STROKE;
      ctx.setLineDash(isSelected ? [6, 3] : []);
      ctx.stroke();
      ctx.fillStyle   = isSelected
        ? `rgba(45,156,219,${ELLIPSE_ALPHA})`
        : `rgba(124,58,237,${ELLIPSE_ALPHA})`;
      ctx.fill();

      // Annotation index label
      ctx.setLineDash([]);
      ctx.font         = "bold 11px Inter, sans-serif";
      ctx.fillStyle    = isSelected ? ELLIPSE_COLOR_ACTIVE : ELLIPSE_COLOR;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i + 1, el.cx, el.cy);
    });

    // Draw in-progress ellipse
    if (currentRect) {
      const { x1, y1, x2, y2 } = currentRect;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, 2 * Math.PI);
      ctx.strokeStyle = ELLIPSE_COLOR;
      ctx.lineWidth   = ELLIPSE_STROKE;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.fillStyle   = `rgba(124,58,237,${ELLIPSE_ALPHA})`;
      ctx.fill();
      ctx.setLineDash([]);
    }
  }, [ellipses, currentRect, selected]);

  useEffect(() => { redraw(); }, [redraw, imgLoaded]);

  // ── Canvas coordinate helper ─────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // ── Mouse handlers ───────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (!drawMode) return;
    const pos = getPos(e);
    setDrawing(true);
    setStartPos(pos);
    setCurrentRect({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
    setSelected(null);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    setCurrentRect((prev) => ({ ...prev, x2: pos.x, y2: pos.y }));
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    const rect = { x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y };
    const rx   = Math.abs(rect.x2 - rect.x1) / 2;
    const ry   = Math.abs(rect.y2 - rect.y1) / 2;

    // Ignore tiny accidental clicks
    if (rx < 8 || ry < 8) {
      setCurrentRect(null);
      return;
    }

    setPendingRect(rect);
    setCurrentRect(null);
    setDrawMode(false);
  };

  // Click existing ellipse to select it
  const handleCanvasClick = (e) => {
    if (drawMode || drawing) return;
    const pos = getPos(e);
    let hit = -1;
    ellipses.forEach((el, i) => {
      const dx = (pos.x - el.cx) / el.rx;
      const dy = (pos.y - el.cy) / el.ry;
      if (dx * dx + dy * dy <= 1) hit = i;
    });
    setSelected(hit >= 0 ? hit : null);
  };

  // ── Confirm annotation comment ──────────────────────────────────────
  const handleConfirmAnnotation = () => {
    if (!pendingRect || !comment.trim()) return;
    const { x1, y1, x2, y2 } = pendingRect;
    const newEllipse = {
      cx:      (x1 + x2) / 2,
      cy:      (y1 + y2) / 2,
      rx:      Math.abs(x2 - x1) / 2,
      ry:      Math.abs(y2 - y1) / 2,
      comment: comment.trim(),
      id:      Date.now(),
    };
    const updated = [...ellipses, newEllipse];
    setEllipses(updated);
    onAnnotationAdd?.(newEllipse);
    setPendingRect(null);
    setComment("");
  };

  const handleCancelAnnotation = () => {
    setPendingRect(null);
    setComment("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      {/* ── Image + canvas overlay (Decorator Pattern) ── */}
      <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <img
          ref={imgRef}
          src={project.mediaUrl}
          alt={project.name}
          onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", display: "block", borderRadius: "var(--radius-xl)" }}
        />

        {/* Canvas overlay — drawn on top of the image */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          style={{
            position:    "absolute",
            inset:       0,
            width:       "100%",
            height:      "100%",
            cursor:      drawMode ? "crosshair" : "default",
            borderRadius: "var(--radius-xl)",
          }}
        />
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <button
          className={drawMode ? "btn btn--primary" : "btn btn--secondary"}
          onClick={() => { setDrawMode((v) => !v); setSelected(null); }}
          style={{ fontSize: "var(--text-sm)" }}
        >
          {/* Ellipse icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="12" rx="10" ry="6" />
          </svg>
          {drawMode ? "Drawing… (drag to place)" : "Add annotation"}
        </button>

        {selected !== null && (
          <button
            className="btn btn--ghost"
            onClick={() => {
              setEllipses((prev) => prev.filter((_, i) => i !== selected));
              setSelected(null);
            }}
            style={{ fontSize: "var(--text-sm)", color: "#E53E3E" }}
          >
            Remove selected
          </button>
        )}

        {ellipses.length > 0 && (
          <span style={{
            fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
            marginLeft: "auto",
          }}>
            {ellipses.length} annotation{ellipses.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Comment prompt (appears after drawing an ellipse) ── */}
      {pendingRect && (
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <p className="card-section-label">Add comment for this annotation</p>
          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
            <input
              className="form-input"
              type="text"
              autoFocus
              placeholder="Describe the change needed here…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmAnnotation()}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn--primary"
              onClick={handleConfirmAnnotation}
              disabled={!comment.trim()}
              style={{ opacity: !comment.trim() ? 0.5 : 1 }}
            >
              Save
            </button>
            <button className="btn btn--ghost" onClick={handleCancelAnnotation}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Annotation list ── */}
      {ellipses.length > 0 && (
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <p className="card-section-label">Annotations ({ellipses.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {ellipses.map((el, i) => (
              <div
                key={el.id}
                onClick={() => setSelected(i === selected ? null : i)}
                style={{
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "var(--space-3)",
                  padding:      "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border:       `1px solid ${i === selected
                    ? "var(--color-primary)"
                    : "var(--color-border-default)"}`,
                  background:   i === selected
                    ? "var(--color-primary-glow)"
                    : "var(--color-bg-surface-alt)",
                  cursor:       "pointer",
                  transition:   "all var(--transition-fast)",
                }}
              >
                {/* Number badge */}
                <div style={{
                  width:          22,
                  height:         22,
                  borderRadius:   "var(--radius-full)",
                  background:     "#7C3AED",
                  color:          "#fff",
                  fontSize:       "11px",
                  fontWeight:     "bold",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                }}>
                  {i + 1}
                </div>
                <p style={{
                  fontSize:   "var(--text-sm)",
                  color:      "var(--color-text-primary)",
                  lineHeight: "var(--leading-relaxed)",
                  flex:       1,
                }}>
                  {el.comment}
                </p>
                <span className="badge badge--unresolved">Unresolved</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}