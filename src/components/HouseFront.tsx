import type { ReactElement } from "react";

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Full front-elevation drawing of a house, generated from the listing id and category. */
export default function HouseFront({ id, cat }: { id: string; cat: string }) {
  const s = hash(id);
  const h = s % 360;
  const wall = `hsl(${(h + 20) % 360} 28% 80%)`;
  const trim = `hsl(${h} 30% 26%)`;
  const roof = `hsl(${(h + 200) % 360} 25% 28%)`;
  const glass = "#bfe0ee";
  const win = (x: number, y: number, w = 24, hh = 28) => (
    <g key={`${x}-${y}-${w}`}>
      <rect x={x} y={y} width={w} height={hh} fill={glass} stroke={trim} strokeWidth="2" />
      <path d={`M${x + w / 2} ${y}v${hh}M${x} ${y + hh / 2}h${w}`} stroke={trim} strokeWidth="1" />
    </g>
  );
  const tree = (x: number) => (
    <g key={x}>
      <rect x={x - 3} y="170" width="6" height="30" fill="#6b4f3a" />
      <circle cx={x} cy="160" r="22" fill={`hsl(${110 + (s % 40)} 35% 32%)`} />
    </g>
  );

  const tower = cat === "apartment" || cat === "condo";
  const modern = cat === "villa";
  const parts: ReactElement[] = [];

  if (tower) {
    parts.push(<rect key="b" x="125" y="28" width="150" height="172" fill={wall} stroke={trim} strokeWidth="3" />);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) parts.push(win(137 + c * 35, 40 + r * 30, 22, 20));
    parts.push(<rect key="d" x="185" y="168" width="30" height="32" fill={trim} />);
  } else if (modern) {
    parts.push(
      <g key="m">
        <rect x="40" y="115" width="320" height="85" fill={wall} stroke={trim} strokeWidth="3" />
        <rect x="105" y="68" width="200" height="47" fill={wall} stroke={trim} strokeWidth="3" />
        <rect x="95" y="60" width="220" height="8" fill={roof} />
        <rect x="30" y="107" width="340" height="8" fill={roof} />
        <rect x="58" y="128" width="160" height="62" fill={glass} stroke={trim} strokeWidth="2" />
        <rect x="238" y="140" width="36" height="60" fill={trim} />
      </g>,
      win(130, 78, 40, 28), win(230, 78, 40, 28), win(300, 130, 40, 40),
    );
  } else {
    parts.push(
      <g key="g">
        <rect x="300" y="55" width="22" height="50" fill={trim} />
        <rect x="85" y="100" width="230" height="100" fill={wall} stroke={trim} strokeWidth="3" />
        <polygon points="65,102 200,38 335,102" fill={roof} />
        <rect x="180" y="148" width="40" height="52" fill={trim} />
      </g>,
      win(105, 118), win(145, 118), win(235, 118), win(275, 118), win(105, 155, 24, 30), win(275, 155, 24, 30),
    );
  }

  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" className="h-full w-full" role="img" aria-label="Front view of the property">
      <defs>
        <linearGradient id={`sky${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${200 + (s % 30)} 70% 78%)`} />
          <stop offset="1" stopColor="#f4f1e8" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky${s})`} />
      <circle cx={330 - (s % 200)} cy="40" r="16" fill="#ffe9a8" />
      <rect y="200" width="400" height="20" fill={`hsl(${100 + (s % 30)} 30% 38%)`} />
      {tree(28)}
      {tree(375)}
      {parts}
    </svg>
  );
}
