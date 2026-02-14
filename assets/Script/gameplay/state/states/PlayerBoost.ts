/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerBoostState.ts
 * Path: assets/Script/gameplay/states/states/
 * Author: alexeygara
 * Last modified: 2026-02-07 18:58
 */

import { ignoreTransition }  from "game/state/game-flow-state";
import { GameFlowStateBase } from "game/state/GameFlowStateBase";
import { GameplayStateID }   from "game/state/GameFlowStateID";
import type {
	GameplayStatesFactory,
	GameplayStatesGuards,
	IGameplayStateContext,
	StateStrategy
}                            from "game_api/states-api";

export class PlayerBoost extends GameFlowStateBase<typeof GameplayStateID.PLAYER_BOOST> {

	readonly stateId = GameplayStateID.PLAYER_BOOST;

	constructor(
		context:IGameplayStateContext,
		factory:GameplayStatesFactory,
		strategies:StateStrategy[],
		exitStrategies?:StateStrategy[],
		guards?:GameplayStatesGuards,
	) {
		super(false,
			  context, factory,
			  strategies, exitStrategies,
			  guards);
	}

	override goBoostUsage():Promise<void> {
		return ignoreTransition();
	}

	override goPlayerTurn():Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_TURN, void 0);
	}

	override goUpdateBoard():Promise<void> {
		return this.transitToState(GameplayStateID.BOARD_UPDATE, void 0);
	}

	override goPlayerWin():Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_WIN, void 0);
	}

	override goPlayerLose():Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_LOSE, void 0);
	}

}