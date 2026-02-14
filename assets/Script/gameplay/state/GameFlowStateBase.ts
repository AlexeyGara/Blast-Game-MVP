/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: StateBase.ts
 * Path: assets/Script/gameplay/states/
 * Author: alexeygara
 * Last modified: 2026-02-01 14:56
 */

import type { GameplayBoostID }    from "game/boosts/BoostID";
import type { SectorPos }          from "game_api/logic-api";
import type {
	GameplayStatesFactory,
	GameplayStatesGuards,
	IGameplayState,
	IGameplayStateContext,
	StateStrategy
}                                  from "game_api/states-api";
import { transitionBlockedResult } from "./game-flow-state";
import type {
	GameplayStateID,
	GameplayStatePayload
}                                  from "./GameFlowStateID";

export abstract class GameFlowStateBase<TStateID extends GameplayStateID> implements IGameplayState {

	abstract readonly stateId:TStateID;

	get canInterrupt():boolean {
		return !this._exiting && this._canInterrupt;
	}

	private readonly _canInterrupt:boolean;
	private readonly _enterStrategies:StateStrategy[];
	private readonly _exitStrategies:StateStrategy[];
	private readonly _context:IGameplayStateContext;
	private readonly _guards?:GameplayStatesGuards;
	private readonly _factory:GameplayStatesFactory;
	private _exiting:boolean = false;

	protected constructor(
		canInterrupt:boolean,
		context:IGameplayStateContext,
		factory:GameplayStatesFactory,
		enterStrategies:StateStrategy[] = [],
		exitStrategies:StateStrategy[]  = [],
		guards?:GameplayStatesGuards,
	) {
		this._guards = guards;
		this._canInterrupt = canInterrupt;
		this._enterStrategies = enterStrategies;
		this._exitStrategies = exitStrategies;
		this._context = context;
		this._factory = factory;
	}

	async exit():Promise<void> {
		this._exiting = true;

		for(const strategy of this._exitStrategies) {
			await strategy.perform();
		}

		this._exiting = false;
	}

	async enter():Promise<void> {
		for(const strategy of this._enterStrategies) {
			await strategy.perform();
		}
	}

	goReadyBoard():Promise<void> {
		return transitionBlockedResult();
	}

	goPlayerTurn():Promise<void> {
		return transitionBlockedResult();
	}

	goBoostUsage(boost:GameplayBoostID):Promise<void> {
		return transitionBlockedResult(boost);
	}

	goPlayerResult(activeBlock:SectorPos):Promise<void> {
		return transitionBlockedResult(activeBlock);
	}

	goPlayerWin():Promise<void> {
		return transitionBlockedResult();
	}

	goPlayerLose():Promise<void> {
		return transitionBlockedResult();
	}

	goUpdateBoard():Promise<void> {
		return transitionBlockedResult();
	}

	protected transitToState<TStateID extends GameplayStateID>(stateId:TStateID,
															   payload:GameplayStatePayload[TStateID]):Promise<void> {

		if(this._guards && !this._guards[stateId].canTransit(payload)) {
			return Promise.resolve();
		}

		const newState = this._factory.getState(stateId, payload);
		return this._context.changeState(newState);
	}
}