/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerHandleBoostActivated.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-13 09:31
 */

import type { GameplayBoostID } from "game/boosts/BoostID";
import type {
	GameProcessResult,
	IGameProcessResultAgent,
	PlayerTurnFlowActor
}                               from "game_api/game-api";
import type { StateStrategy }   from "game_api/states-api";

type BoostActivateFlowActor = Pick<PlayerTurnFlowActor, 'onBoostActivate'>;

type BoostsProvider = Pick<GameProcessResult, 'boosters'>;

export class HandleBoostActivated implements StateStrategy {

	private readonly _boostId:GameplayBoostID;
	private readonly _gameProcessAgent:IGameProcessResultAgent;
	private readonly _availableBoostsProvider:() => BoostsProvider;
	private readonly _boostFlowParticipants:Iterable<BoostActivateFlowActor | BoostActivateFlowActor[]>;

	constructor(
		boostId:GameplayBoostID,
		gameProcessAgent:IGameProcessResultAgent,
		availableBoostsProvider:() => BoostsProvider,
		boostFlowActorsOrderedList:Iterable<BoostActivateFlowActor | BoostActivateFlowActor[]>,
	) {
		this._boostId = boostId;
		this._gameProcessAgent = gameProcessAgent;
		this._availableBoostsProvider = availableBoostsProvider;
		this._boostFlowParticipants = boostFlowActorsOrderedList;
	}

	async perform():Promise<void> {

		this._gameProcessAgent.enterBooster(this._boostId);

		for(const boostActorOrList of this._boostFlowParticipants) {
			if(Array.isArray(boostActorOrList)) {

				const waiters:Promise<void>[] = [];

				for(const turnActor of boostActorOrList) {
					waiters.push(turnActor.onBoostActivate(this._boostId, this._availableBoostsProvider().boosters));
				}

				await Promise.all(waiters);
			}
			else {
				await boostActorOrList.onBoostActivate(this._boostId, this._availableBoostsProvider().boosters);
			}
		}
	}

}