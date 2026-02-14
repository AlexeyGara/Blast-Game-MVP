/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameLoopPhaseOrder.ts
 * Path: assets/Script/app/core/gameloop/
 * Author: alexeygara
 * Last modified: 2026-02-09 03:02
 */

export const GameLoopPhase = {
	INPUT: 0,
	/** logic update phase: update controls, update logic actions */
	LOGIC: 1,
	/** animations update phase: update animations before render views */
	ANIMATION: 2,
	/** sounds update phase: update standalone sounds and sounds that dependents on animations */
	AUDIO: 3,
	/** views update phase: update views after animations and before render */
	VIEW: 4
} as const;

export type GameLoopPhase = typeof GameLoopPhase[keyof typeof GameLoopPhase];

export const OrderedGameLoopPhases:GameLoopPhase[] = Object.values(GameLoopPhase);
