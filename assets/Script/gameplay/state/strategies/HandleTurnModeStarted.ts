/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: HandleTurnModeStarted.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-15 23:49
 */

import type { PlayerTurnFlowActor } from "game_api/game-api";
import type { StateStrategy }       from "game_api/states-api";

type StartTurnFlowActor = Pick<PlayerTurnFlowActor, 'onStartTurn'>;

export class HandleTurnModeStarted implements StateStrategy {

	private readonly _turnFlowParticipants:Iterable<StartTurnFlowActor | StartTurnFlowActor[]>;

	constructor(
		turnFlowActorsOrderedList:Iterable<StartTurnFlowActor | StartTurnFlowActor[]>,
	) {
		this._turnFlowParticipants = turnFlowActorsOrderedList;
	}

	async perform():Promise<void> {

		for(const turnActorOrList of this._turnFlowParticipants) {
			if(Array.isArray(turnActorOrList)) {

				const waiters:Promise<void>[] = [];

				for(const turnActor of turnActorOrList) {
					waiters.push(turnActor.onStartTurn());
				}

				await Promise.all(waiters);
			}
			else {
				await turnActorOrList.onStartTurn();
			}
		}
	}

}