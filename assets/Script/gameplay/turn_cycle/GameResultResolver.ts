/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameResultResolver.ts
 * Path: assets/Script/gameplay/turn_cycle/
 * Author: alexeygara
 * Last modified: 2026-02-10 08:55
 */

import { GameStatus } from "game/GameStatus";
import type {
	GameProcessResult,
	IGameProcessResolver
}                     from "game_api/game-api";

export class GameResultResolver implements IGameProcessResolver {

	constructor() {
	}

	resolve(gameProcess:GameProcessResult):GameStatus {

		if(gameProcess.totalScore >= gameProcess.scoreToWin) {
			return GameStatus.WIN_STATUS;
		}

		if(gameProcess.turnsLeft <= 0) {
			return GameStatus.LOSE_STATUS;
		}

		return GameStatus.CONTINUE;
	}

}