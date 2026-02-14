/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: gameloop-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:28
 */

import type { GameLoopPhase } from "core/gameloop/GameLoopPhase";

export type GameLoopPhaseActor<TPhase extends GameLoopPhase = GameLoopPhase> = {

	readonly updatePhase:TPhase;
}

export interface IGameLoopUpdatable<TPhase extends GameLoopPhase = GameLoopPhase> extends GameLoopPhaseActor<TPhase> {

	update(deltaTimeMs:number):void;
}

export interface IGameLoopUpdater {

	add(updatable:IGameLoopUpdatable):void;

	remove(updatable:IGameLoopUpdatable):void;
}

export type GameTime = {
	/** total time, ms */
	readonly totalTimeMs:number;
	/** delta time, ms */
	readonly deltaTimeMs:number;
}

export interface IScaledGameTime extends GameTime {
	/** Native total time, ms */
	readonly originTotalTimeMs:number;

	/** Native delta time, ms */
	readonly originDeltaTimeMs:number;

	setScale(timeScale:1 | number):void;
}

export interface IGameTimeAgent {

	addDeltaTime(deltaTimeMs:number):void;
}

export type AnimationFrameReceiver = (totalTimeMs:number) => void;

export interface IFrameRequester {

	requestNextFrame(cancelPrevious:boolean):void;

	cancelRequestedFrame():void;

	setFrameReceiver(frameReceiver:AnimationFrameReceiver | null):void;
}