import { useEffect, useRef } from 'react';

export default function StarBackground() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;
    let stars = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 5500); // more stars
      for (let i = 0; i < count; i++) {
        const tier = Math.random(); // 0=tiny far, 0.5=mid, 1=close big
        stars.push({
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          // Size variation: tiny (0.15) to chunky (2.2)
          r:     tier < 0.5
                   ? Math.random() * 0.5 + 0.15          // tiny background stars
                   : tier < 0.85
                   ? Math.random() * 0.8 + 0.5           // mid stars
                   : Math.random() * 1.0 + 1.0,          // big foreground stars
          // Opacity variation
          alpha: tier < 0.5
                   ? Math.random() * 0.35 + 0.15
                   : tier < 0.85
                   ? Math.random() * 0.5  + 0.3
                   : Math.random() * 0.4  + 0.55,
          // Speed variation: bg stars slow, fg stars fast
          speed: tier < 0.5
                   ? Math.random() * 0.18 + 0.04
                   : tier < 0.85
                   ? Math.random() * 0.35 + 0.15
                   : Math.random() * 0.55 + 0.35,
          drift:        (Math.random() - 0.5) * 0.12,
          twinkle:      Math.random() * Math.PI * 2,
          twinkleSpeed: tier > 0.85
                          ? Math.random() * 0.045 + 0.02  // big stars twinkle faster
                          : Math.random() * 0.018 + 0.004,
          // Parallax depth: 0 = no parallax (bg), 1 = full parallax (fg)
          depth: tier < 0.5 ? 0.08 : tier < 0.85 ? 0.25 : 0.55,
          // Color tint
          hue: Math.random() > 0.82
                 ? (Math.random() > 0.5 ? '168,155,255' : '45,255,192')
                 : '240,238,255',
          // Base position for parallax offset
          baseX: 0,
          baseY: 0,
        });
        // Store base position
        stars[stars.length - 1].baseX = stars[stars.length - 1].x;
        stars[stars.length - 1].baseY = stars[stars.length - 1].y;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse tracking (lerp)
      targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.04;
      targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.04;

      const mx = (targetRef.current.x / canvas.width  - 0.5) * 2; // -1 to 1
      const my = (targetRef.current.y / canvas.height - 0.5) * 2;

      stars.forEach((s) => {
        s.twinkle += s.twinkleSpeed;
        const twinkleFactor = 0.65 + 0.35 * Math.sin(s.twinkle);
        const alpha = s.alpha * twinkleFactor;

        // Parallax offset based on depth
        const px = mx * s.depth * 28;
        const py = my * s.depth * 18;

        const drawX = s.x + px;
        const drawY = s.y + py;

        // Draw star — big stars get a soft glow halo
        if (s.r > 1.2) {
          const grd = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, s.r * 3.5);
          grd.addColorStop(0,   `rgba(${s.hue},${alpha})`);
          grd.addColorStop(0.4, `rgba(${s.hue},${alpha * 0.35})`);
          grd.addColorStop(1,   `rgba(${s.hue},0)`);
          ctx.beginPath();
          ctx.arc(drawX, drawY, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(drawX, drawY, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.hue},${alpha})`;
        ctx.fill();

        // Move
        s.y -= s.speed;
        s.x += s.drift;

        // Wrap
        if (s.y < -4)              { s.y = canvas.height + 4; s.x = Math.random() * canvas.width; }
        if (s.x < -4)               s.x = canvas.width + 4;
        if (s.x > canvas.width + 4) s.x = -4;
      });

      animId = requestAnimationFrame(draw);
    };

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    resize();
    init();
    draw();

    window.addEventListener('resize',    () => { resize(); init(); });
    window.addEventListener('mousemove', onMouse);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}