import { Link } from "@tanstack/react-router";

export function HomeScreen() {
  return (
    <div className="landing-container">
      <header className="landing-hero">
        <div className="landing-badge">KeyForge Training Grounds</div>
        <h1 className="landing-title">BrainForge</h1>
        <p className="landing-tagline">
          Master the Crucible. Test your card recognition and train your board vision.
        </p>
      </header>

      <div className="landing-grid">
        {/* Card Recognition / Practice Mode */}
        <div className="landing-card primary-card">
          <div className="landing-card-icon">🧠</div>
          <div className="landing-card-body">
            <h2>Fragment Challenge</h2>
            <p>
              Train your card intuition and art recognition. Identify KeyForge cards
              by matching isolated snippets of artwork, power, armor, bonus Æmber,
              and rules text.
            </p>
            <ul className="landing-features">
              <li>✨ Filter by expansion, house, and card types</li>
              <li>🎯 Focus on specific zones (Name, Rules, Stats, Æmber)</li>
              <li>🔗 Shareable practice links with custom presets</li>
            </ul>
          </div>
          <div className="landing-card-actions">
            <Link to="/practice/setup" style={{ textDecoration: "none" }}>
              <button className="landing-btn primary-btn">
                Start Challenge →
              </button>
            </Link>
          </div>
        </div>

        {/* Card Viewer */}
        <div className="landing-card viewer-card-mode">
          <div className="landing-card-icon">🃏</div>
          <div className="landing-card-body">
            <h2>Card Database & Viewer</h2>
            <p>
              Explore all KeyForge cards across sets. Inspect clipped zone overlays,
              study high-res card art, and test fragment extraction.
            </p>
            <ul className="landing-features">
              <li>📚 Fast local IndexedDB with 2,500+ cards</li>
              <li>🔎 Filter by expansion, house, and card type</li>
              <li>✂️ Visual zone clipping inspection</li>
            </ul>
          </div>
          <div className="landing-card-actions">
            <Link to="/viewer" style={{ textDecoration: "none" }}>
              <button className="landing-btn secondary-btn">
                Open Card Viewer →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
