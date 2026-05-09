"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import ImageViewer from "../../(auth)/dashboard/_components/ImageViewer";
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

export default function ClientView({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Create a mock project for demonstration since Firebase isn't set up yet
  const [project] = useState({
    id: "mock123",
    name: "Homepage Redesign v1",
    client: "Acme Corp",
    projectType: "image",
    mediaUrl: "https://picsum.photos/seed/mediaflow/1024/768",
    status: "Awaiting Client Feedback"
  });

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
            Client Review: {project.name}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Token: {token}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Note about temporary */}
          <div style={{ 
            background: 'var(--color-bg-surface-alt)', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)', 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border-default)'
          }}>
            <strong>Demo Mode:</strong> Firebase not configured. Annotations are temporary.
          </div>
          
          <button
            onClick={toggleDarkMode}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            aria-label="Toggle theme"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="app-main" style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 'var(--space-6)', alignItems: 'start' }}>
          
          {/* Left side: Image Viewer */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ImageViewer project={project} onAnnotationAdd={(ann) => console.log('Mock annotation submitted:', ann)} />
          </div>

          {/* Right side: Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card">
              <h3 className="card-section-label">Actions</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: '1.5' }}>
                Review the draft and leave annotations directly on the image. Your feedback helps us perfect the final deliverable.
              </p>
              
              <button 
                className="btn btn--primary" 
                style={{ width: '100%', marginBottom: 'var(--space-3)', justifyContent: 'center' }} 
                onClick={() => alert("Submit Feedback is disabled in demo mode (Firebase not connected).")}
              >
                Submit Feedback
              </button>

              <button 
                className="btn btn--ghost" 
                style={{ width: '100%', color: 'var(--color-text-muted)', justifyContent: 'center' }} 
                onClick={() => alert("Downloading is temporarily disabled because Firebase and Cloudinary drafts are not fully set up yet.")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 'var(--space-2)' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Draft
              </button>
            </div>
            
            <div className="card">
                <h3 className="card-section-label">Demo Instructions</h3>
                <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', paddingLeft: 'var(--space-4)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <li>Click <strong>"Add annotation"</strong>.</li>
                    <li>Drag a circle over a specific part of the image.</li>
                    <li>Add a comment for the editor.</li>
                </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
