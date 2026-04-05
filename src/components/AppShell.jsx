import { Link, useLocation } from "react-router-dom";

const STEPS = [
  { path: "/setup",     label: "Setup" },
  { path: "/interview", label: "Interview" },
  { path: "/feedback",  label: "Feedback" },
  { path: "/summary",   label: "Summary" }
];

// Pre-calculate Cyan Network Geometry (Dual-Edge Clustered)
const CYAN_NETWORK = (() => {
  const nodes = [];
  const lines = [];

  const pseudoRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 160; i++) {
    const pr1 = pseudoRandom(i * 13.1);
    const pr2 = pseudoRandom(i * 29.3);
    const pr3 = pseudoRandom(i * 37.9);
    
    // Half on left, half on right
    const isLeftSide = i % 2 === 0;

    let x, distanceToEdge;
    if (isLeftSide) {
      x = (pr1 * pr1) * 400; // bias towards x = 0
      distanceToEdge = x;
    } else {
      x = 1000 - (pr1 * pr1) * 400; // bias towards x = 1000
      distanceToEdge = 1000 - x;
    }
    
    // Bias somewhat randomly across y, slightly expanding past boundaries
    const y = -50 + pr2 * 700; 
    
    const isCore = distanceToEdge < 150;
    
    const r = isCore ? 1.5 + pr3 * 2.5 : 1 + pr3;
    const opacity = isCore ? (0.7 + pr1 * 0.3) : Math.max(0.1, 1 - (distanceToEdge / 400));
    
    nodes.push({ x, y, r, opacity, isCore });
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      
      const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
      let threshold = 90; 
      if (n1.isCore || n2.isCore) threshold = 140; 
      
      if (dist < threshold) {
        if (dist > 60 && pseudoRandom(i * j) > 0.4) continue;

        const isThick = dist < 70 && pseudoRandom(i + j) > 0.5;
        const strokeWidth = isThick ? 0.8 + pseudoRandom(i * j) * 1 : 0.4 + pseudoRandom(i + j) * 0.4;
        
        let opacity = 1 - (dist / threshold);
        // Dim lines that are far from the edges
        const avgX = (n1.x + n2.x) / 2;
        const avgDistEdge = Math.min(avgX, 1000 - avgX);
        opacity *= Math.max(0.1, 1 - (avgDistEdge / 400));

        lines.push({ 
          x1: n1.x, y1: n1.y, 
          x2: n2.x, y2: n2.y, 
          strokeWidth,
          opacity: opacity * (isThick ? 0.9 : 0.4)
        });
      }
    }
  }

  return { nodes, lines };
})();
function AppShell({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const currentStep = STEPS.findIndex(s => s.path === location.pathname);

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ backgroundColor: "#020418" }}
    >

      {/* Cyan Geometric Network Background Effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        
        {/* Deep blue void base (Lighter) */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 100% 50%, rgba(0, 150, 255, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 0% 50%, rgba(0, 150, 255, 0.07) 0%, transparent 60%),
            linear-gradient(135deg, #050813 0%, #010309 100%)
          `
        }} />

        {/* Network Field SVG */}
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full opacity-90">
          
          {/* Connecting Lines */}
          <g>
            {CYAN_NETWORK.lines.map((l, i) => (
              <line 
                key={`l${i}`} 
                x1={l.x1} y1={l.y1} 
                x2={l.x2} y2={l.y2} 
                stroke="#00ccff" 
                strokeWidth={l.strokeWidth} 
                opacity={l.opacity}
              />
            ))}
          </g>

          {/* Nodes */}
          <g>
            {CYAN_NETWORK.nodes.map((n, i) => (
              <circle 
                key={`n${i}`} 
                cx={n.x} cy={n.y} 
                r={n.r} 
                fill="#00ffff" 
                opacity={n.opacity} 
              >
                 {n.isCore && <animate attributeName="opacity" values={`${n.opacity};${n.opacity * 0.4};${n.opacity}`} dur={`${2 + i % 3}s`} repeatCount="indefinite" />}
              </circle>
            ))}
          </g>
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-6" style={{ zIndex: 1 }}>

        {/* Header */}
        <header
          className="mb-8 flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            background: "rgba(10, 22, 40, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(34, 211, 238, 0.1)"
          }}
        >
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo mark */}
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "linear-gradient(135deg, #0891b2, #22d3ee)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#060d1e" fillOpacity="0.9" />
                <circle cx="8" cy="8" r="2.5" fill="#060d1e" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-wide text-base group-hover:text-brand-300 transition-colors">
              HireSense
            </span>
          </Link>

          {/* Step indicator */}
          {!isLanding && currentStep >= 0 && (
            <div className="flex items-center gap-1">
              {STEPS.map((step, i) => {
                const isDone    = i < currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step.path} className="flex items-center gap-1">
                    <Link
                      to={step.path}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: isCurrent ? "rgba(34,211,238,0.12)" : "transparent",
                        color: isCurrent ? "#22d3ee" : isDone ? "#4a8a9a" : "#2d4a60",
                        border: isCurrent ? "1px solid rgba(34,211,238,0.3)" : "1px solid transparent"
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: isCurrent ? "#22d3ee" : isDone ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.05)",
                          color: isCurrent ? "#060d1e" : isDone ? "#22d3ee" : "#3d6080"
                        }}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </Link>
                    {i < STEPS.length - 1 && (
                      <div className="w-4 h-px" style={{ background: isDone ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.06)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-8 text-center" style={{ color: "#1d3a55", fontSize: "0.7rem" }}>
          Made by Deeptansh Nagar
        </footer>
      </div>
    </div>
  );
}

export default AppShell;
