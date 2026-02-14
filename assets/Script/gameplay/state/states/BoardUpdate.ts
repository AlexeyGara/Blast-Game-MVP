/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoardUpdateState.ts
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

export class BoardUpdate extends GameFlowStateBase<typeof GameplayStateID.BOARD_UPDATE> {

	readonly stateId = GameplayStateID.BOARD_UPDATE;

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

	override goPlayerTurn():Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_TURN, void 0);
	}

	override goUpdateBoard():Promise<void> {
		return ignoreTransition();
	}

}