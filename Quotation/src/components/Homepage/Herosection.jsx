
import React, { useEffect, useRef, useState } from "react";

const HeroSection = ({ onGetStarted }) => {
  const canvasRef = useRef(null);
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = [];
    const count = 6000;
    const r = 200;

    const getTextPoints = (text) => {
      const c = document.createElement("canvas");
      const cx = c.getContext("2d");

      cx.font = "bold 140px Arial";
      const m = cx.measureText(text);

      c.width = m.width + 100;
      c.height = 200;

      cx.font = "bold 140px Arial";
      cx.fillStyle = "white";
      cx.textAlign = "center";
      cx.textBaseline = "middle";
      cx.fillText(text, c.width / 2, c.height / 2);

      const data = cx.getImageData(0, 0, c.width, c.height).data;
      const pts = [];

      for (let y = 0; y < c.height; y += 3) {
        for (let x = 0; x < c.width; x += 3) {
          const i = (y * c.width + x) * 4;
          if (data[i + 3] > 120) {
            pts.push({
              x: x - c.width / 2,
              y: y - c.height / 2,
            });
          }
        }
      }
      return pts;
    };

    const textPoints = getTextPoints("Smart Matrix");

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = 2 * Math.PI * Math.random();

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 8;

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const tp = textPoints[Math.floor(Math.random() * textPoints.length)];

      particles.push({
        x, y, z,
        vx, vy,
        tx: tp.x,
        ty: tp.y,
        fx: (Math.random() - 0.5) * w,
        fy: (Math.random() - 0.5) * h,
        glow: Math.random() > 0.9,
        glowPhase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      particles.forEach(p => {
        let x = p.x;
        let y = p.y;
        let z = p.z;

        const ry = time * 0.4;
        const rx = time * 0.3;

        let dx = Math.cos(ry) * x + Math.sin(ry) * z;
        let dz = -Math.sin(ry) * x + Math.cos(ry) * z;
        let dy = Math.cos(rx) * y - Math.sin(rx) * dz;

        let drawX, drawY;

        // ===== STAGES =====
        if (time < 1.5) {
          drawX = dx;
          drawY = dy;
        }

        // 💥 REAL EXPLOSION (physics-based)
        else if (time < 2.5) {
          const t = (time - 1.5) / 1;

          // smooth ease (important)
          const ease = t * t * (3 - 2 * t);

          // move from sphere → full screen
          drawX = dx + (p.fx - dx) * ease;
          drawY = dy + (p.fy - dy) * ease;
        }

        // 🧲 FORM TEXT
        else {
          const t = Math.min((time - 2.5) / 2, 1);

          const ex = p.fx;
          const ey = p.fy;

          drawX = ex + (p.tx - ex) * t;
          drawY = ey + (p.ty - ey) * t;

          if (t === 1) setShowUI(true);
        }

        ctx.beginPath();

        // ✨ SMALL GLOW
        if (p.glow) {
          p.glowPhase += 0.08;
          const glowSize = 1 + Math.sin(p.glowPhase) * 0.6;

          ctx.shadowBlur = 6; // smaller glow
          ctx.shadowColor = "#a855f7";
          ctx.arc(w / 2 + drawX, h / 2 + drawY, glowSize, 0, Math.PI * 2);
        } else {
          ctx.shadowBlur = 0;
          ctx.arc(w / 2 + drawX, h / 2 + drawY, 1, 0, Math.PI * 2);
        }

        ctx.fillStyle = "#c084fc";
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

  }, []);

  return (
    <section className="hero">
      <canvas ref={canvasRef} />

      {showUI && (
        <>
          <div className="welcome">Welcome to</div>

          <div className="cta">
            <button className="primary" onClick={onGetStarted}>
              Get Started
            </button>
            <button className="secondary">Watch Demo</button>
          </div>
        </>
      )}

      <style>{`
        .hero {
          width: 100%;
          height: 100%;
          background: #050816;
          position: relative;
          overflow: hidden;
        }

        canvas {
          display: block;
        }

        .welcome {
          position: absolute;
          top: 35%;
          left: 50%;
          transform: translateX(-50%);
          color: #60a5fa;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 0.4em;
          opacity: 0;
          animation: fadeIn 1s forwards;
        }

        .cta {
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
          opacity: 0;
          animation: fadeUp 1s forwards;
          animation-delay: 0.5s;
        }

        .primary {
          padding: 12px 30px;
          background: #2563eb;
          color: white;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
        }

        .secondary {
          padding: 12px 30px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          border-radius: 9999px;
          cursor: pointer;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

