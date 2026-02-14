/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: EBlockType.ts
 * Path: assets/Script/gameplay/logic/
 * Author: alexeygara
 * Last modified: 2026-02-01 21:17
 */

//import { BlockColorType } from "./BlockColorType";

//const ceilPowerOf2 = (n:number):number => 1 << (32 - Math.clz32(n));

/**
 * A bit-mask for special blocks type.
 * <br/>**WARNING:** Please update {@link #BlockSpecialType} values if you changed the value of this bit-mask.
 */
export const SpecialBlockTypeMask = 8;//ceilPowerOf2(Object.keys(EBlockColor).length);

//TODO: implement diagonal-rocket special-type of blocks {@link #ERocketDirection}
/**
 * <br/>**NOTE:** Diagonal rockets {@link #RocketType.DIAGONAL_TL_BR}, {@link #RocketType.DIAGONAL_TR_BL} not implemented yet.
 * */
export const BlockSpecialType = {
	BOMB: 8,//SpecialBlockTypeMask,
	BOMB_MAX: 9,//SpecialBlockTypeMask + 1,
	ROCKET_VERTICAL: 10,//SpecialBlockTypeMask + 2,
	ROCKET_HORIZONTAL: 11,//SpecialBlockTypeMask + 3
} as const;

export type BlockSpecialType = typeof BlockSpecialType[keyof typeof BlockSpecialType];

export const BlockSpecialTypes = Object.values(BlockSpecialType);

export const isSpecialBlock = (blockData:number):blockData is BlockSpecialType => {
	return BlockSpecialTypes.indexOf(blockData as BlockSpecialType) != -1;
};

export const getSpecialBlockIndex = (blockData:number):number | -1 => {
	if(isSpecialBlock(blockData)) {
		return blockData ^ (SpecialBlockTypeMask as number);
	}

	return -1;
};