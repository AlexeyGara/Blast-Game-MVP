/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoardReadyState.ts
 * Path: assets/Script/gameplay/states/states/
 * Author: alexeygara
 * Last modified: 2026-02-07 21:26
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

export class BoardReady extends GameFlowStateBase<typeof GameplayStateID.BOARD_READY> {

	readonly stateId = GameplayStateID.BOARD_READY;

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

	override goReadyBoard():Promise<void> {
		return ignoreTransition();
	}

	override goPlayerTurn():Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_TURN, void 0);
	}
}