/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: HudView.ts
 * Path: assets/Script/gameplay/view/hud/
 * Author: alexeygara
 * Last modified: 2026-02-10 06:53
 */

import { GameStatus }            from "game/GameStatus";
import type {
	GameProcessResult,
	IGameProcessObserver,
	IHudViewImpl,
	PlayerTurnFlowActor
}                                from "game_api/game-api";
import type { PlayerTurnResult } from "game_api/logic-api";

export class HudUI implements PlayerTurnFlowActor,
							  IGameProcessObserver {

	private readonly _hudViewImpl:IHudViewImpl;

	constructor(
		hudComponent:IHudViewImpl,
	) {
		this._hudViewImpl = hudComponent;
	}

	onStartTurn():Promise<void> {
		return Promise.resolve();
	}

	onBoostActivate():Promise<void> {
		return Promise.resolve();
	}

	onEndTurn(_:number, turnsLeft:number):Promise<void> {

		void this._hudViewImpl.turnCountUpdate(turnsLeft);

		return Promise.resolve();
	}

	onCompleteResult(_:PlayerTurnResult, gameProcessResult:GameProcessResult):Promise<void> {

		return this._hudViewImpl.scoreCountUpdate(gameProcessResult.totalScore);
	}

	onGameProcessUpdate(gameProcessResult:GameProcessResult):Promise<void> {

		switch(gameProcessResult.status) {
			case GameStatus.READY:
				this._hudViewImpl.getReady(gameProcessResult.turnsLeft, gameProcessResult.scoreToWin);
				return Promise.resolve();

			case GameStatus.CONTINUE:
			case GameStatus.WIN_STATUS:
			case GameStatus.LOSE_STATUS:
				void this._hudViewImpl.gameStatusUpdate(gameProcessResult.status);
				return Promise.resolve();

			default:
				assertNever(gameProcessResult.status);
		}
	}

}