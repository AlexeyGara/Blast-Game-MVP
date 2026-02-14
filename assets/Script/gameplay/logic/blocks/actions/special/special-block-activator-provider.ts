/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: SpecialBlockActivatorProvider.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/special/
 * Author: alexeygara
 * Last modified: 2026-02-04 20:31
 */

import { BombActivator }              from "game/logic/blocks/actions/special/BombActivator";
import { RocketActivator }            from "game/logic/blocks/actions/special/RocketActivator";
import { BlockSpecialType }           from "game/logic/blocks/BlockSpecialType";
import { RocketType }                 from "game/logic/blocks/special/RocketType";
import type { GameSettingsDTO }       from "game_api/game-settings";
import type { SpecialBlockActivator } from "game_api/logic-api";

export const specialBlockActivatorProvider = (specialBlockType:BlockSpecialType,
											  settings:GameSettingsDTO):SpecialBlockActivator => {

	if(specialBlockType == BlockSpecialType.BOMB) {
		return new BombActivator(settings.gamefield.blocks.special.bomb.BOMB_WAVE_RADIUS,
								 settings.gamefield.blocks.special.bomb.BOMB_INCLUDE_DIAGONALS);
	}
	if(specialBlockType == BlockSpecialType.BOMB_MAX) {
		return new BombActivator(settings.gamefield.blocks.special.bomb.BOMB_MAX_WAVE_RADIUS,
								 settings.gamefield.blocks.special.bomb.BOMB_MAX_INCLUDE_DIAGONALS);
	}
	if(specialBlockType == BlockSpecialType.ROCKET_HORIZONTAL) {
		return new RocketActivator(RocketType.HORIZONTAL,
								   settings.gamefield.blocks.special.rocket.LINE_DISTANCE);
	}
	if(specialBlockType == BlockSpecialType.ROCKET_VERTICAL) {
		return new RocketActivator(RocketType.VERTICAL,
								   settings.gamefield.blocks.special.rocket.LINE_DISTANCE);
	}

	assertNever(specialBlockType);
};