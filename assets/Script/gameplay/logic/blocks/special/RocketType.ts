/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: RocketType.ts
 * Path: assets/Script/gameplay/logic/blocks/special/
 * Author: alexeygara
 * Last modified: 2026-02-07 17:43
 */

export const RocketType = {
	VERTICAL: 0,
	HORIZONTAL: 1,
	DIAGONAL_TL_BR: 2,
	DIAGONAL_TR_BL: 3
} as const;

export type RocketType = typeof RocketType[keyof typeof RocketType];