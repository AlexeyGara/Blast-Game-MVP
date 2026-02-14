/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: StateID.ts
 * Path: assets/Script/gameplay/states/
 * Author: alexeygara
 * Last modified: 2026-02-01 13:52
 */

import type { SectorPos }       from "game_api/logic-api";
import type { GameplayBoostID } from "game/boosts/BoostID";

export const GameplayStateID = {
	BOARD_READY: 'ready_board',
	PLAYER_TURN: 'player_turn',
	PLAYER_BOOST: 'player_use_boost',
	PLAYER_RESULT: 'player_result',
	PLAYER_WIN: 'player_win',
	PLAYER_LOSE: 'player_lose',
	BOARD_UPDATE: 'update_board',
} as const;

export type GameplayStateID = typeof GameplayStateID[keyof typeof GameplayStateID];

export type GameplayStatePayload = {
	'ready_board':void;
	'player_turn':void;
	'player_use_boost':{ boost:GameplayBoostID };
	'player_result':{ activeBlock:SectorPos };
	'player_win':void;
	'player_lose':void;
	'update_board':void;
};
