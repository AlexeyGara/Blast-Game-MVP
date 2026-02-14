/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: RestoreService.ts
 * Path: assets/Script/app/services/
 * Author: alexeygara
 * Last modified: 2026-02-11 14:17
 */

import type {
	GameProcessDTO,
	IGameRestoreService,
	IGameStoreService,
	StoredGameProcessKey
} from "core_api/service-types";

export class StoreService implements IGameStoreService,
									 IGameRestoreService {

	storeGameProcess(gameDataJson:GameProcessDTO):Promise<StoredGameProcessKey> {
		//TODO: implement
		console.log(gameDataJson);
		return Promise.resolve("stored-game-data-key");
	}

	restoreGameProcess(key:StoredGameProcessKey):Promise<GameProcessDTO> {
		//TODO: implement
		console.log(key);
		return Promise.resolve('{ "game_process": {} }');
	}

}