/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: event-api.ts
 * Path: assets/Script/gameplay/api/
 * Author: alexeygara
 * Last modified: 2026-02-08 05:58
 */

import type { GameplayEventID } from "game/event/EventID";

export type GameplayEvent = {

	[GameplayEventID.NEXT_TURN]:void;

	[GameplayEventID.REFILL_BOARD]:void;

	[GameplayEventID.PLAYER_WON]:void;

	[GameplayEventID.PLAYER_LOST]:void;

	[GameplayEventID.GAME_END]:void;

}