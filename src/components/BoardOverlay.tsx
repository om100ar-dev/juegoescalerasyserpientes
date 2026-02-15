import { SNAKES, LADDERS, cellToGridPosition } from '../constants/board';

/**
 * SVG overlay that draws visual snakes and ladders on top of the board grid.
 * Snakes are rendered as wavy curves with a head.
 * Ladders are rendered as two rails with rungs.
 */

// Snake color palette (matching the reference board)
const SNAKE_COLORS = [
    { body: '#2d9e8f', head: '#1a7a6e' },  // teal
    { body: '#e8c84a', head: '#c9a530' },  // yellow
    { body: '#9b6bb0', head: '#7d4f94' },  // purple
    { body: '#c96b5f', head: '#a84e42' },  // coral
    { body: '#5a9e5a', head: '#3d7a3d' },  // green
    { body: '#d4845a', head: '#b66a3e' },  // orange
    { body: '#6a8ec9', head: '#4c6fa8' },  // blue
    { body: '#c95a8f', head: '#a84073' },  // pink
    { body: '#7ab87a', head: '#5a9a5a' },  // light green
    { body: '#b0855a', head: '#8e6b40' },  // brown
];

// Ladder color — wooden brown tones
const LADDER_COLORS = [
    '#8B6F5E',
    '#7A5F50',
    '#6B5040',
    '#9E7E6C',
    '#8C6E5A',
    '#7B5E4C',
    '#A08070',
    '#8D6D5A',
    '#9A7A68',
];

/**
 * Convert a cell number to its center position in a percentage-based coordinate system.
 * The grid renders top-to-bottom, with row 9 (cells 91-100) at the top.
 */
function cellToSvgPosition(cellNumber: number): { x: number; y: number } {
    const { row, col } = cellToGridPosition(cellNumber);
    // row 0 = bottom, row 9 = top
    // In screen coords: visualRow = 9 - row (top = 0)
    const visualRow = 9 - row;
    const x = (col + 0.5) * 10; // percentage (0-100%)
    const y = (visualRow + 0.5) * 10;
    return { x, y };
}

function SnakePath({
    from,
    to,
    colorIndex,
}: {
    from: number;
    to: number;
    colorIndex: number;
}) {
    const start = cellToSvgPosition(from);
    const end = cellToSvgPosition(to);
    const colors = SNAKE_COLORS[colorIndex % SNAKE_COLORS.length];

    // Create a wavy path between start and end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const waves = Math.max(2, Math.floor(dist / 15));

    // Generate control points for wave
    const points: string[] = [`M ${start.x} ${start.y}`];
    for (let i = 0; i < waves; i++) {
        const t1 = (i + 0.5) / waves;
        const t2 = (i + 1) / waves;
        const mx = start.x + dx * t1;
        const my = start.y + dy * t1;
        const ex = start.x + dx * t2;
        const ey = start.y + dy * t2;

        // Perpendicular offset for wave
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const amp = 3 + (i % 2 === 0 ? 2 : -2);

        points.push(
            `Q ${mx + perpX * amp} ${my + perpY * amp}, ${ex} ${ey}`
        );
    }

    const pathD = points.join(' ');

    return (
        <g>
            {/* Snake body shadow */}
            <path
                d={pathD}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform="translate(0.3, 0.3)"
            />
            {/* Snake body */}
            <path
                d={pathD}
                fill="none"
                stroke={colors.body}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0.85}
            />
            {/* Snake body inner highlight */}
            <path
                d={pathD}
                fill="none"
                stroke={`${colors.body}88`}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 3"
            />
            {/* Snake head (circle at start position — snakes head is at the top, tail at bottom) */}
            <circle
                cx={start.x}
                cy={start.y}
                r="2.2"
                fill={colors.head}
                stroke={colors.body}
                strokeWidth="0.6"
            />
            {/* Eyes */}
            <circle cx={start.x - 0.7} cy={start.y - 0.6} r="0.5" fill="white" />
            <circle cx={start.x + 0.7} cy={start.y - 0.6} r="0.5" fill="white" />
            <circle cx={start.x - 0.7} cy={start.y - 0.6} r="0.25" fill="#222" />
            <circle cx={start.x + 0.7} cy={start.y - 0.6} r="0.25" fill="#222" />
            {/* Tongue */}
            <path
                d={`M ${start.x} ${start.y + 1.5} L ${start.x - 0.5} ${start.y + 2.5} M ${start.x} ${start.y + 1.5} L ${start.x + 0.5} ${start.y + 2.5}`}
                fill="none"
                stroke="#e44"
                strokeWidth="0.3"
                strokeLinecap="round"
            />
            {/* Snake tail (tapered end) */}
            <circle cx={end.x} cy={end.y} r="0.8" fill={colors.body} opacity={0.6} />
        </g>
    );
}

function LadderPath({
    from,
    to,
    colorIndex,
}: {
    from: number;
    to: number;
    colorIndex: number;
}) {
    const start = cellToSvgPosition(from); // bottom
    const end = cellToSvgPosition(to); // top
    const color = LADDER_COLORS[colorIndex % LADDER_COLORS.length];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular direction for ladder width
    const perpX = (-dy / dist) * 2;
    const perpY = (dx / dist) * 2;

    // Left and right rails
    const leftStart = { x: start.x + perpX, y: start.y + perpY };
    const leftEnd = { x: end.x + perpX, y: end.y + perpY };
    const rightStart = { x: start.x - perpX, y: start.y - perpY };
    const rightEnd = { x: end.x - perpX, y: end.y - perpY };

    // Rungs
    const rungs = Math.max(3, Math.floor(dist / 8));
    const rungElements: JSX.Element[] = [];
    for (let i = 1; i < rungs; i++) {
        const t = i / rungs;
        const lx = leftStart.x + (leftEnd.x - leftStart.x) * t;
        const ly = leftStart.y + (leftEnd.y - leftStart.y) * t;
        const rx = rightStart.x + (rightEnd.x - rightStart.x) * t;
        const ry = rightStart.y + (rightEnd.y - rightStart.y) * t;

        rungElements.push(
            <line
                key={`rung-${i}`}
                x1={lx}
                y1={ly}
                x2={rx}
                y2={ry}
                stroke={color}
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity={0.9}
            />
        );
    }

    return (
        <g>
            {/* Shadow */}
            <line
                x1={leftStart.x + 0.3}
                y1={leftStart.y + 0.3}
                x2={leftEnd.x + 0.3}
                y2={leftEnd.y + 0.3}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <line
                x1={rightStart.x + 0.3}
                y1={rightStart.y + 0.3}
                x2={rightEnd.x + 0.3}
                y2={rightEnd.y + 0.3}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            {/* Left rail */}
            <line
                x1={leftStart.x}
                y1={leftStart.y}
                x2={leftEnd.x}
                y2={leftEnd.y}
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity={0.9}
            />
            {/* Right rail */}
            <line
                x1={rightStart.x}
                y1={rightStart.y}
                x2={rightEnd.x}
                y2={rightEnd.y}
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity={0.9}
            />

            {/* Rungs */}
            {rungElements}
        </g>
    );
}

export function BoardOverlay() {
    const snakeEntries = Object.entries(SNAKES).map(([from, to]) => ({
        from: Number(from),
        to,
    }));

    const ladderEntries = Object.entries(LADDERS).map(([from, to]) => ({
        from: Number(from),
        to,
    }));

    return (
        <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
            preserveAspectRatio="none"
        >
            {/* Draw ladders first (behind snakes) */}
            {ladderEntries.map((entry, i) => (
                <LadderPath
                    key={`ladder-${entry.from}`}
                    from={entry.from}
                    to={entry.to}
                    colorIndex={i}
                />
            ))}

            {/* Draw snakes on top */}
            {snakeEntries.map((entry, i) => (
                <SnakePath
                    key={`snake-${entry.from}`}
                    from={entry.from}
                    to={entry.to}
                    colorIndex={i}
                />
            ))}
        </svg>
    );
}
