/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameProcessResolveStrategy.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-10 18:13
 */

import type {
	GameProcessResult,
	IGameProcessObserver,
	IGameProcessResolver,
	IGameProcessResultAgent
}                             from "game_api/game-api";
import type { StateStrategy } from "game_api/states-api";

export class GameResolveStatus implements StateStrategy {

	private readonly _gameProcessAgent:IGameProcessResultAgent;
	private readonly _gameProcessResolver:IGameProcessResolver;
	private readonly _gameProcessResultProvider:() => GameProcessResult;
	private readonly _gameProcessObserversOrdered:Readonly<Iterable<IGameProcessObserver>>;

	constructor(
		gameProcessResultProvider:() => GameProcessResult,
		gameProcessAgent:IGameProcessResultAgent,
		gameProcessResolver:IGameProcessResolver,
		gameProcessObserversOrdered:Readonly<Iterable<IGameProcessObserver>>
	) {
		this._gameProcessResultProvider = gameProcessResultProvider;
		this._gameProcessAgent = gameProcessAgent;
		this._gameProcessResolver = gameProcessResolver;
		this._gameProcessObserversOrdered = gameProcessObserversOrdered;
	}

	async perform():Promise<void> {

		const nextGameStatus = this._gameProcessResolver.resolve(this._gameProcessResultProvider());
		this._gameProcessAgent.setStatus(nextGameStatus);

		for(const observer of this._gameProcessObserversOrdered) {
			await observer.onGameProcessUpdate(this._gameProcessResultProvider());
		}
	}

}