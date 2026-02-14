/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerLoseState.ts
 * Path: assets/Script/gameplay/states/states/
 * Author: alexeygara
 * Last modified: 2026-02-07 18:58
 */

import { ignoreTransition }  from "game/state/game-flow-state";
import { GameFlowStateBase } from "game/state/GameFlowStateBase";
import { GameplayStateID }   from "game/state/GameFlowStateID";
import type {
	GameplayStatesFactory,
	IGameplayStateContext,
	StateStrategy
}                            from "game_api/states-api";

/** Terminal state */
export class PlayerLoseState extends GameFlowStateBase<typeof GameplayStateID.PLAYER_LOSE> {

	readonly stateId = GameplayStateID.PLAYER_LOSE;

	constructor(
		context:IGameplayStateContext,
		factory:GameplayStatesFactory,
		strategies:StateStrategy[],
		exitStrategies?:StateStrategy[]
	) {
		super(false,
			  context, factory,
			  strategies, exitStrategies);
	}

	override goPlayerLose():Promise<void> {
		return ignoreTransition();
	}

}