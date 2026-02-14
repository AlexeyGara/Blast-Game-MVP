/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerLoseStrategy.ts
 * Path: assets/Script/gameplay/states/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-06 05:01
 */

import type { StateStrategy } from "game_api/states-api";

/**
 * Animate and show lost result. Nothing to do else - no events, no wait player interaction.
 */
export class PlayerHandleLostStatus implements StateStrategy {

	perform():Promise<void> {

		return Promise.resolve();
	}
}