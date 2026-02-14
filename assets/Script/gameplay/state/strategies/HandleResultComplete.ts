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
}                                from "game_api/game-api";
import type { PlayerTurnResult } from "game_api/logic-api";
import type { StateStrategy }    from "game_api/states-api";

type CompleteResultFlowActor = Pick<PlayerTurnFlowActor, 'onCompleteResult'>;

export class HandleResultComplete implements StateStrategy {

	private readonly _turnResultProvider:() => PlayerTurnResult;
	private readonly _gameProcessResultProvider:() => GameProcessResult;
	private readonly _turnFlowParticipants:Iterable<CompleteResultFlowActor | CompleteResultFlowActor[]>;

	constructor(
		turnResultProvider:() => PlayerTurnResult,
		gameProcessResultProvider:() => GameProcessResult,
		turnFlowAgentsOrderedList:Iterable<CompleteResultFlowActor | CompleteResultFlowActor[]>,
	) {
		this._turnResultProvider = turnResultProvider;
		this._gameProcessResultProvider = gameProcessResultProvider;
		this._turnFlowParticipants = turnFlowAgentsOrderedList;
	}

	async perform():Promise<void> {

		for(const turnActorOrList of this._turnFlowParticipants) {
			if(Array.isArray(turnActorOrList)) {
				const waiters:Promise<void>[] = [];

				for(const turnActor of turnActorOrList) {
					waiters.push(
						turnActor.onCompleteResult(this._turnResultProvider(), this._gameProcessResultProvider()));
				}

				await Promise.all(waiters);
			}
			else {
				await turnActorOrList.onCompleteResult(this._turnResultProvider(), this._gameProcessResultProvider());
			}
		}
	}

}