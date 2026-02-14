/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoostID.ts
 * Path: assets/Script/gameplay/boosts/
 * Author: alexeygara
 * Last modified: 2026-02-04 03:07
 */

export const GameplayBoostID = {
	TELEPORT: 'boost-teleport',
	BOMB: 'boost-bomb'
} as const;

export type GameplayBoostID = typeof GameplayBoostID[keyof typeof GameplayBoostID];