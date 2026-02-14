/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerEndTurnStrategy.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-10 11:28
 */

import type {
	GameProcessResult,
	PlayerTurnFlowActor
}                             from "game_api/game-api";
import type { StateStrategy } from "game_api/states-api";

type TurnsNumeratorProvider = () => Pick<GameProcessResult, 'turnsLeft' | 'turnsCompleted'>;

type EndTurnFlowActor = Pick<PlayerTurnFlowActor, 'onEndTurn'>;

export class HandleTurnModeEnded implements StateStrategy {

	private readonly _turnsNumeratorProvider:TurnsNumeratorProvider;
	private readonly _turnFlowParticipants:Iterable<EndTurnFlowActor | EndTurnFlowActor[]>;

	constructor(
		turnsNumeratorProvider:TurnsNumeratorProvider,
		turnFlowActorsOrderedList:Iterable<EndTurnFlowActor | EndTurnFlowActor[]>,
	) {
		this._turnsNumeratorProvider = turnsNumeratorProvider;
		this._turnFlowParticipants = turnFlowActorsOrderedList;
	}

	async perform():Promise<void> {

		const turnsNumerator = this._turnsNumeratorProvider();

		for(const turnActorOrList of this._turnFlowParticipants) {
			if(Array.isArray(turnActorOrList)) {

				const waiters:Promise<void>[] = [];

				for(const turnActor of turnActorOrList) {
					waiters.push(turnActor.onEndTurn(turnsNumerator.turnsCompleted, turnsNumerator.turnsLeft));
				}

				await Promise.all(waiters);
			}
			else {
				await turnActorOrList.onEndTurn(turnsNumerator.turnsCompleted, turnsNumerator.turnsLeft);
			}
		}
	}

}