/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: PlayerWinTransition.ts
 * Path: assets/Script/gameplay/states/transitions/
 * Author: alexeygara
 * Last modified: 2026-02-01 16:57
 */

import type { StateStrategy } from "game_api/states-api";

/**
 * Animate and show win result. Nothing to do else - no events, no wait player interaction.
 */
export class PlayerHandleWinStatus implements StateStrategy {

	perform():Promise<void> {

		return Promise.resolve();
	}
}