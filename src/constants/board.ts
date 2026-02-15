/**
 * Snakes and Ladders — Board Constants
 *
 * Classic 10×10 board (cells 1-100) with boustrophedon (alternating) row direction.
 * Row 0 (bottom) goes left→right: cells 1-10
 * Row 1 goes right→left: cells 11-20
 * etc.
 */

/** Serpientes (Snakes): origin → destination (always goes DOWN) */
export const SNAKES: Record<number, number> = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78,
};

/** Escaleras (Ladders): origin → destination (always goes UP) */
export const LADDERS: Record<number, number> = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100,
};

/** All special cells (for quick lookup) */
export const SNAKE_CELLS = new Set(Object.keys(SNAKES).map(Number));
export const LADDER_CELLS = new Set(Object.keys(LADDERS).map(Number));

/**
 * Convert a cell number (1-100) to grid row and column (0-indexed).
 * Row 0 is the BOTTOM row (cells 1-10), Row 9 is the TOP (cells 91-100).
 * Even rows go left→right, odd rows go right→left (boustrophedon).
 */
export function cellToGridPosition(cellNumber: number): { row: number; col: number } {
    const zeroIndexed = cellNumber - 1;
    const row = Math.floor(zeroIndexed / 10);
    const colInRow = zeroIndexed % 10;
    // Even row: left→right, Odd row: right→left
    const col = row % 2 === 0 ? colInRow : 9 - colInRow;
    return { row, col };
}

/**
 * Build the board layout as a 2D array for rendering.
 * Returns rows from TOP (row index 0 = cells 91-100) to BOTTOM (row index 9 = cells 1-10).
 * Each row contains cell numbers in the correct visual order.
 */
export function buildBoardLayout(): number[][] {
    const board: number[][] = [];
    for (let visualRow = 0; visualRow < 10; visualRow++) {
        const boardRow = 9 - visualRow; // top row first
        const row: number[] = [];
        for (let col = 0; col < 10; col++) {
            if (boardRow % 2 === 0) {
                // Even board row: left→right
                row.push(boardRow * 10 + col + 1);
            } else {
                // Odd board row: right→left
                row.push(boardRow * 10 + (9 - col) + 1);
            }
        }
        board.push(row);
    }
    return board;
}

/**
 * Compute new position after a dice roll, applying snakes/ladders.
 * Returns the final position and whether a snake or ladder was hit.
 */
export function computeMove(
    currentPosition: number,
    diceValue: number
): { finalPosition: number; hitSnake: boolean; hitLadder: boolean; intermediatePosition: number } {
    let newPosition = currentPosition + diceValue;

    // Must land exactly on 100 — if exceeded, stay in place
    if (newPosition > 100) {
        return {
            finalPosition: currentPosition,
            hitSnake: false,
            hitLadder: false,
            intermediatePosition: currentPosition,
        };
    }

    const intermediatePosition = newPosition;

    let hitSnake = false;
    let hitLadder = false;

    // Check for snake
    if (SNAKES[newPosition] !== undefined) {
        newPosition = SNAKES[newPosition];
        hitSnake = true;
    }
    // Check for ladder
    else if (LADDERS[newPosition] !== undefined) {
        newPosition = LADDERS[newPosition];
        hitLadder = true;
    }

    return { finalPosition: newPosition, hitSnake, hitLadder, intermediatePosition };
}
