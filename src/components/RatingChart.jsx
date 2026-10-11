import { useId, useMemo, useState } from 'react';

import './RatingChart.css';

const W = 600;
const H = 220;
const PAD = { top: 18, right: 16, bottom: 26, left: 46 };

const formatDate = value =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function RatingChart({ points, accent = '#7928ca', label = 'Rating' }) {
  const gradientId = `chart-grad-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [hover, setHover] = useState(null);

  const chart = useMemo(() => {
    const list = points ?? [];
    if (list.length === 0) return null;

    const ratings = list.map(point => point.rating);
    let min = Math.min(...ratings);
    let max = Math.max(...ratings);
    if (min === max) {
      min -= 50;
      max += 50;
    } else {
      const padding = Math.max(20, (max - min) * 0.15);
      min -= padding;
      max += padding;
    }

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const first = list[0].t;
    const span = list[list.length - 1].t - first || 1;

    const px = point =>
      list.length === 1 ? PAD.left + innerW / 2 : PAD.left + ((point.t - first) / span) * innerW;
    const py = rating => PAD.top + innerH - ((rating - min) / (max - min)) * innerH;

    const coords = list.map(point => ({ ...point, x: px(point), y: py(point.rating) }));

    let line = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i += 1) line += ` L ${coords[i].x} ${coords[i].y}`;
    const baseY = PAD.top + innerH;
    const area = `${line} L ${coords[coords.length - 1].x} ${baseY} L ${coords[0].x} ${baseY} Z`;

    const ticks = 4;
    const grid = [];
    for (let i = 0; i <= ticks; i += 1) {
      const value = Math.round(min + ((max - min) * i) / ticks);
      grid.push({ value, y: py(value) });
    }

    return { coords, line, area, grid, innerH };
  }, [points]);

  const handleMove = event => {
    if (!chart) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    chart.coords.forEach((coord, i) => {
      const distance = Math.abs(coord.x - x);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  if (!chart) {
    return (
      <div className="chart chart--empty">
        <p>Complete study tasks to build your rating graph.</p>
      </div>
    );
  }

  const active = hover === null ? null : chart.coords[hover];
  const last = chart.coords[chart.coords.length - 1];

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart__svg"
        role="img"
        aria-label={`${label} over time`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.26" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {chart.grid.map((line, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={line.y}
              x2={W - PAD.right}
              y2={line.y}
              className="chart__grid"
            />
            <text x={PAD.left - 8} y={line.y + 3} className="chart__ylabel" textAnchor="end">
              {line.value}
            </text>
          </g>
        ))}

        {chart.coords.length > 1 ? <path d={chart.area} fill={`url(#${gradientId})`} /> : null}
        <path d={chart.line} className="chart__line" style={{ stroke: accent }} fill="none" />

        {chart.coords.map((coord, i) => (
          <circle
            key={i}
            cx={coord.x}
            cy={coord.y}
            r={2}
            className="chart__dot"
            style={{ fill: accent }}
          />
        ))}

        <circle
          cx={last.x}
          cy={last.y}
          r={3.6}
          className="chart__dot chart__dot--last"
          style={{ fill: accent }}
        />

        {active ? (
          <g>
            <line
              x1={active.x}
              y1={PAD.top}
              x2={active.x}
              y2={PAD.top + chart.innerH}
              className="chart__cursor"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={4.6}
              className="chart__dot"
              style={{ fill: accent }}
            />
          </g>
        ) : null}

        <text x={PAD.left} y={H - 8} className="chart__xlabel" textAnchor="start">
          {formatDate(chart.coords[0].t)}
        </text>
        {chart.coords.length > 1 ? (
          <text x={W - PAD.right} y={H - 8} className="chart__xlabel" textAnchor="end">
            {formatDate(last.t)}
          </text>
        ) : null}
      </svg>

      {active ? (
        <div className="chart__tip" style={{ left: `${(active.x / W) * 100}%` }}>
          <strong>{active.rating}</strong>
          <span>{formatDate(active.t)}</span>
        </div>
      ) : null}
    </div>
  );
}
