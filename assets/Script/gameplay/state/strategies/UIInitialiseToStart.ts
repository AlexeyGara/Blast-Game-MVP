/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: HudReadyStrategy.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-10 12:19
 */

import type {
	GameProcessResult,
	IGameProcessObserver
}                             from "game_api/game-api";
import type { StateStrategy } from "game_api/states-api";

export class UIInitialiseToStart implements StateStrategy {

	private readonly _uiUpdaters:Readonly<IGameProcessObserver[]>;
	private readonly _gameProcessResultProvider:() => GameProcessResult;

	constructor(
		uiUpdaters:Readonly<IGameProcessObserver[]>,
		gameProcessResultProvider:() => GameProcessResult
	) {
		this._uiUpdaters = uiUpdaters;
		this._gameProcessResultProvider = gameProcessResultProvider;
	}

	perform():Promise<void> {

		const waiters:Promise<void>[] = [];

		const gameProcessResult = this._gameProcessResultProvider();

		for(const observer of this._uiUpdaters) {
			waiters.push(observer.onGameProcessUpdate(gameProcessResult));
		}

		return Promise.all(waiters).then();
	}

}