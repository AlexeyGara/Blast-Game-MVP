/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: UserService.ts
 * Path: assets/Script/app/services/
 * Author: alexeygara
 * Last modified: 2026-02-11 14:18
 */

import type {
	IUserProgressLoader,
	IUserProgressSaver,
	StoredGameProcessKey,
	UserProfileDTO,
	UserProgressData
} from "core_api/service-types";

export class UserService implements IUserProgressSaver,
									IUserProgressLoader {

	saveUserProgress(userProfileJson:UserProfileDTO, storedGameProcessKey:StoredGameProcessKey):Promise<void> {
		//TODO: implement
		console.log(userProfileJson, storedGameProcessKey);
		return Promise.resolve();
	}

	loadUserProgress():Promise<UserProgressData> {
		//TODO: implement
		return Promise.resolve(['{ "user_profile": {} }', "stored-game-data-key"]);
	}

}