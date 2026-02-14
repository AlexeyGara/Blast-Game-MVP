/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: EBlockColor.ts
 * Path: assets/Script/gameplay/logic/blocks/
 * Author: alexeygara
 * Last modified: 2026-02-01 22:48
 */

/**
 * Simple blocks color type.
 * <br/>**WARNING:** Please update {@link #SpecialBlockTypeMask} after add a new enum color-value for simple block.
 */
export const BlockColorType = {
	RED: 1,
	YELLOW: 2,
	GREEN: 3,
	PINK: 4,
	BLUE: 5,
} as const;

export type BlockColorType = typeof BlockColorType[keyof typeof BlockColorType];

export const BlockColorTypes = Object.values(BlockColorType);

export const isSimpleBlock = (blockData:number):blockData is BlockColorType => {
	return BlockColorTypes.indexOf(blockData as BlockColorType) != -1;
};

export const getSimpleBlockIndex = (blockData:number):number | -1 => {
	return BlockColorTypes.indexOf(blockData as BlockColorType);
};