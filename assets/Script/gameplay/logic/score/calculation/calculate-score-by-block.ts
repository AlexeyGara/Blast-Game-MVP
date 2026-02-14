/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: calculate-score-by-block.ts
 * Path: assets/Script/gameplay/logic/score/calculation/
 * Author: alexeygara
 * Last modified: 2026-02-07 04:07
 */

import type { ScoreByBlockCalculator } from "game_api/game-api";
import type { BlockType }              from "game_api/logic-api";
import {
	BlockColorType,
	isSimpleBlock
}                                      from "game/logic/blocks/BlockColorType";
import {
	BlockSpecialType,
	isSpecialBlock
}                                      from "game/logic/blocks/BlockSpecialType";

//TODO: move to singleton gameplay settings
const SCORE_BY_SIMPLE_BLOCK = 1;
const SCORE_BY_BOMB = 0;
const SCORE_BY_BOMB_MAX = 0;
const SCORE_BY_ROCKET = 0;

export const calculateScoreByBlock:ScoreByBlockCalculator = (blockType:BlockType) => {
	if(isSimpleBlock(blockType)) {
		switch(blockType) {
			case BlockColorType.RED:
			case BlockColorType.YELLOW:
			case BlockColorType.GREEN:
			case BlockColorType.PINK:
			case BlockColorType.BLUE:
				return SCORE_BY_SIMPLE_BLOCK;
		}
	}
	else if(isSpecialBlock(blockType)) {
		switch(blockType) {
			case BlockSpecialType.BOMB:
				return SCORE_BY_BOMB;
			case BlockSpecialType.BOMB_MAX:
				return SCORE_BY_BOMB_MAX;
			case BlockSpecialType.ROCKET_HORIZONTAL:
			case BlockSpecialType.ROCKET_VERTICAL:
				return SCORE_BY_ROCKET;
		}
	}
	assertNever(blockType);
};