/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: action-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-11 18:11
 */

import type { GameLoopPhase }      from "core/gameloop/GameLoopPhase";
import type { GameLoopPhaseActor } from "core_api/gameloop-types";

export interface IActionManager extends GameLoopPhaseActor<typeof GameLoopPhase.LOGIC>,
										ActionStarter {

	cancel(action:IAction, withComplete?:boolean):void;

	cancelAllByTag(tag:string, withComplete?:boolean):void;

	cancelAll(withComplete?:boolean):void;
}

export type ActionStarter = {

	start(action:IAction & CanBeUpdate):Promise<OnFinishResult>;
}

export interface IAction {
	readonly id:string;
	readonly completed:boolean;
	readonly canceled:boolean;
	readonly progress:number;

	cancel(withComplete?:boolean):void;
}
