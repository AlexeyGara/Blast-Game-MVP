/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerTurnState.ts
 * Path: assets/Script/gameplay/states/states/
 * Author: alexeygara
 * Last modified: 2026-02-07 18:58
 */

import type { GameplayBoostID } from "game/boosts/BoostID";
import { ignoreTransition }     from "game/state/game-flow-state";
import { GameFlowStateBase }    from "game/state/GameFlowStateBase";
import { GameplayStateID }      from "game/state/GameFlowStateID";
import type { SectorPos }       from "game_api/logic-api";
import type {
	GameplayStatesFactory,
	GameplayStatesGuards,
	IGameplayStateContext,
	StateStrategy
}                               from "game_api/states-api";

export class PlayerTurnState extends GameFlowStateBase<typeof GameplayStateID.PLAYER_TURN> {

	readonly stateId = GameplayStateID.PLAYER_TURN;

	constructor(
		context:IGameplayStateContext,
		factory:GameplayStatesFactory,
		guards:GameplayStatesGuards,
		strategies:StateStrategy[],
		exitStrategies?:StateStrategy[]
	) {
		super(
			true,
			context, factory,
			strategies, exitStrategies,
			guards);
	}

	override goPlayerTurn():Promise<void> {
		return ignoreTransition();
	}

	override goBoostUsage(boost:GameplayBoostID):Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_BOOST, { boost });
	}

	override goPlayerResult(activeBlock:SectorPos):Promise<void> {
		return this.transitToState(GameplayStateID.PLAYER_RESULT, { activeBlock });
	}
}