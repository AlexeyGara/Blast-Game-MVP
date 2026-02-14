/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: block-action-provider.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/
 * Author: alexeygara
 * Last modified: 2026-02-07 03:51
 */

import { SimpleBlockAction }             from "game/logic/blocks/actions/SimpleBlockAction";
import { specialBlockActivatorProvider } from "game/logic/blocks/actions/special/special-block-activator-provider";
import { SpecialBlockAction }            from "game/logic/blocks/actions/SpecialBlockAction";
import {
	BlockColorType,
	isSimpleBlock
}                                        from "game/logic/blocks/BlockColorType";
import { isSpecialBlock }                from "game/logic/blocks/BlockSpecialType";
import type { GameSettingsDTO }          from "game_api/game-settings";
import type {
	BlockType,
	IBlockAction
}                                        from "game_api/logic-api";

export const blockActionProvider = (blockType:BlockType, settings:GameSettingsDTO):IBlockAction<BlockType> => {

	if(isSimpleBlock(blockType)) {
		switch(blockType) {
			case BlockColorType.RED:
			case BlockColorType.YELLOW:
			case BlockColorType.GREEN:
			case BlockColorType.PINK:
			case BlockColorType.BLUE:
				return new SimpleBlockAction(blockType);
		}
	}
	else if(isSpecialBlock(blockType)) {
		return new SpecialBlockAction(blockType,
									  specialBlockActivatorProvider(blockType, settings),
									  (blockType) => specialBlockActivatorProvider(blockType, settings));
	}

	assertNever(blockType);
};