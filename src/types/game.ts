/** A player in the game */
export interface Player {
    id: string;
    name: string;
    position: number; // 0 = not started, 1-100
    avatar: string;   // emoji
}

/** Room status */
export type RoomStatus = 'waiting' | 'playing' | 'finished';

/** A room row from Supabase */
export interface Room {
    id: string;
    room_code: string;
    players: Player[];
    current_turn: string | null;
    dice_value: number;
    last_move: string;
    winner: string | null;
    status: RoomStatus;
    created_at: string;
}

/** The local game state derived from the room */
export interface GameState {
    room: Room | null;
    myPlayer: Player | null;
    opponent: Player | null;
    isMyTurn: boolean;
    isLoading: boolean;
    error: string | null;
}

/** Dice value 1-6 */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
