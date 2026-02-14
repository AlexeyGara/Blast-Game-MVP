/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: animation-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:23
 */

import type { GameLoopPhase }      from "core/gameloop/GameLoopPhase";
import type { GameLoopPhaseActor } from "core_api/gameloop-types";

export interface IAnimationManager extends IAnimationPlayer,
										   GameLoopPhaseActor<typeof GameLoopPhase.ANIMATION> {

	cancelAllByTag(tag:string, withComplete?:boolean):void;

	cancelAll(withComplete?:boolean):void;
}

export type AnimationStarter = {

	/**
	 * Star to play animation with specified ID.
	 * @param animationId Animation identifier (animation ID)
	 * @return A promise that resolved only when animation 'finished' successfully. And rejected if no animation found with current ID.
	 */
	start(animationId:string):Promise<void>;
}

export interface IAnimationPlayer {

	play(animation:IAnimation & CanBeUpdate):Promise<OnFinishResult>;

	cancel(animation:IAnimation, withComplete?:boolean):void;
}

export interface IAnimation {

	readonly tag:string;
	readonly paused:boolean;
	readonly finished:boolean;
	readonly canceled:boolean;
	readonly progress:number;

	pause():void;

	resume():void;

	cancel(withComplete?:boolean):void;
}

export type IAnimationConsumer = {

	produceAnimationPlayer(manager:IAnimationPlayer):void;
}
