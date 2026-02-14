/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoostsView.ts
 * Path: assets/Script/gameplay/view/boosts/
 * Author: alexeygara
 * Last modified: 2026-02-13 08:55
 */

import { GameplayBoostID } from "game/boosts/BoostID";
import { GameStatus }      from "game/GameStatus";
import type {
	GameProcessResult,
	IBoostsViewImpl,
	IGameProcessObserver,
	PlayerTurnFlowActor
}                          from "game_api/game-api";
import type {
	GameBoosters,
	PlayerTurnResult
}                          from "game_api/logic-api";

export class BoostsUI implements PlayerTurnFlowActor,
								 IGameProcessObserver {

	private readonly _boostsViewImpl:IBoostsViewImpl;

	constructor(
		boostsComponent:IBoostsViewImpl
	) {
		this._boostsViewImpl = boostsComponent;
	}

	onStartTurn():Promise<void> {

		this._boostsViewImpl.enableInteraction();

		return Promise.resolve();
	}

	onBoostActivate(boostId:GameplayBoostID, boostsLeft:GameBoosters):Promise<void> {

		let boostCount = 0;

		switch(boostId) {
			case GameplayBoostID.TELEPORT:
				boostCount = boostsLeft.teleport;
				break;

			case GameplayBoostID.BOMB:
				boostCount = boostsLeft.bomb;
				break;

			default:
				assertNever(boostId);
		}

		void this._boostsViewImpl.updateBoosterCount(boostId, boostCount);

		this._boostsViewImpl.disableInteraction();

		return Promise.resolve();
	}

	onEndTurn():Promise<void> {

		this._boostsViewImpl.disableInteraction();

		return Promise.resolve();
	}

	onCompleteResult(turnResult:PlayerTurnResult, gameProcessResult:GameProcessResult):Promise<void> {

		const boosters = Object.values(GameplayBoostID);

		for(const boostId of boosters) {
			switch(boostId) {
				case GameplayBoostID.TELEPORT:
					if(turnResult.reward.teleport) {
						void this._boostsViewImpl.updateBoosterCount(boostId,
																	 gameProcessResult.boosters.teleport);
					}
					break;

				case GameplayBoostID.BOMB:
					if(turnResult.reward.bomb) {
						void this._boostsViewImpl.updateBoosterCount(boostId,
																	 gameProcessResult.boosters.bomb);
					}
					break;

				default:
					assertNever(boostId);
			}
		}

		return Promise.resolve();
	}

	onGameProcessUpdate(gameProcessResult:GameProcessResult):Promise<void> {

		switch(gameProcessResult.status) {
			case GameStatus.READY:
				this._boostsViewImpl.getReady(gameProcessResult.boosters);
				return Promise.resolve();

			case GameStatus.CONTINUE:
			case GameStatus.WIN_STATUS:
			case GameStatus.LOSE_STATUS:
				return Promise.resolve();

			default:
				assertNever(gameProcessResult.status);
		}
	}

}