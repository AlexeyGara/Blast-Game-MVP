/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerWinState.ts
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
export class PlayerWinState extends GameFlowStateBase<typeof GameplayStateID.PLAYER_WIN> {

	readonly stateId = GameplayStateID.PLAYER_WIN;

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

	override goPlayerWin():Promise<void> {
		return ignoreTransition();
	}

}