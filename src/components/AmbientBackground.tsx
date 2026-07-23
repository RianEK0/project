const particles = [
  { x: 8, y: 16, size: 10, delay: 0, duration: 12 },
  { x: 18, y: 34, size: 5, delay: 1.8, duration: 10 },
  { x: 27, y: 72, size: 8, delay: 2.5, duration: 14 },
  { x: 39, y: 22, size: 7, delay: 1, duration: 11 },
  { x: 48, y: 58, size: 12, delay: 3, duration: 13 },
  { x: 59, y: 30, size: 6, delay: 2.2, duration: 9 },
  { x: 68, y: 68, size: 9, delay: 1.4, duration: 12 },
  { x: 77, y: 18, size: 11, delay: 0.8, duration: 15 },
  { x: 88, y: 44, size: 5, delay: 2.9, duration: 10 },
  { x: 92, y: 74, size: 7, delay: 1.5, duration: 13 },
];

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-16rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[var(--accent)] opacity-20 blur-[160px]" />
      <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-[var(--accent-2)] opacity-20 blur-[150px]" />
      <div className="absolute bottom-[-12rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[var(--accent-3)] opacity-15 blur-[170px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
      {particles.map((particle) => (
        <span
          key={`${particle.x}-${particle.y}`}
          className="particle-dot"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
