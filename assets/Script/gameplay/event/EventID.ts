/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: EventID.ts
 * Path: assets/Script/gameplay/event/
 * Author: alexeygara
 * Last modified: 2026-02-03 13:52
 */

export const GameplayEventID = {
	/** Start player turn and wait player interaction. */
	NEXT_TURN: 'player-next',

	/** Player turn's result calculated and applied. Need to refill game-board with new blocks. */
	REFILL_BOARD: 'board-refill',

	/** Player win. Go to game-end next after wait until some animations done and go next app-state. */
	PLAYER_WON: 'player-won',

	/** Player lose. Go to game-end next after wait until some animations done and go next app-state. */
	PLAYER_LOST: 'player-lost',

	/** Game is end/over.  */
	GAME_END: 'game-end'
} as const;

export type GameplayEventID = typeof GameplayEventID[keyof typeof GameplayEventID];
