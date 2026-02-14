/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: UserStoreGameProcess.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-11 09:33
 */

import type {
	IGameStoreService,
	IUserProgressSaver
}                                 from "core_api/service-types";
import type { GameProcessMapper } from "game/service/GameProcessMapper";
import type { GameProcessResult } from "game_api/game-api";
import type { BlocksFieldData }   from "game_api/logic-api";
import type { StateStrategy }     from "game_api/states-api";

export class UserStoreGameProcess implements StateStrategy {

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _gameProcessResultProvider:() => GameProcessResult;
	private readonly _mapper:GameProcessMapper;
	private readonly _storeService:IGameStoreService;
	private readonly _userService:IUserProgressSaver;

	constructor(
		fieldProvider:() => BlocksFieldData,
		gameProcessResultProvider:() => GameProcessResult,
		mapper:GameProcessMapper,
		storeService:IGameStoreService,
		userService:IUserProgressSaver
	) {
		this._fieldProvider = fieldProvider;
		this._gameProcessResultProvider = gameProcessResultProvider;
		this._mapper = mapper;
		this._storeService = storeService;
		this._userService = userService;
	}

	async perform():Promise<void> {

		const dto = this._mapper.serialize(this._fieldProvider(), this._gameProcessResultProvider());

		const gameProcessStoreKey = await this._storeService.storeGameProcess(dto);

		await this._userService.saveUserProgress("", gameProcessStoreKey);
	}

}