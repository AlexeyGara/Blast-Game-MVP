/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: EGameStatus.ts
 * Path: assets/Script/gameplay/
 * Author: alexeygara
 * Last modified: 2026-02-07 01:45
 */

export const GameStatus = {
	READY: 0,
	CONTINUE: 1,
	WIN_STATUS: 2,
	LOSE_STATUS: 3,
} as const;

export type GameStatus = typeof GameStatus[keyof typeof GameStatus];