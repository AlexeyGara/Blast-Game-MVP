/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: EBlockType.ts
 * Path: assets/Script/gameplay/api/
 * Author: alexeygara
 * Last modified: 2026-02-01 13:08
 */

import type { GameplayBoostID } from "game/boosts/BoostID";
import type {
	GameplayStateID,
	GameplayStatePayload
}                               from "game/state/GameFlowStateID";
import type { SectorPos }       from "./logic-api";

export type StateStrategy = {

	perform():Promise<void>;
}

export interface IGameplayStateContext {

	changeState(newState:IGameplayState):Promise<void>;
}

export interface IGameplayState<TStateID extends GameplayStateID = GameplayStateID> {

	readonly stateId:TStateID;

	readonly canInterrupt:boolean;

	exit():Promise<void>;

	enter():Promise<void>;

	goReadyBoard():Promise<void>;

	goPlayerTurn():Promise<void>;

	goBoostUsage(boost:GameplayBoostID):Promise<void>;

	goPlayerResult(activeBlock:SectorPos):Promise<void>;

	goPlayerWin():Promise<void>;

	goPlayerLose():Promise<void>;

	goUpdateBoard():Promise<void>;
}

export type StateEnterGuard<TStateID extends GameplayStateID> = {

	canTransit(payload:GameplayStatePayload[TStateID]):boolean;
}

export type GameplayStatesGuards<TStateID extends GameplayStateID = GameplayStateID> = {
	[P in TStateID]:StateEnterGuard<TStateID>;
}

export type GameplayStatesFactory = {

	getState<TStateID extends GameplayStateID>(stateId:TStateID,
											   payload:GameplayStatePayload[TStateID]):IGameplayState<TStateID>;
}

export type StateStrategyProvider = {

	getStrategies<TStateID extends GameplayStateID>(stateId:TStateID,
													payload:GameplayStatePayload[TStateID]):[StateStrategy[], StateStrategy[]];
}