/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: service-types.ts
 * Path: assets/Script/app/core/api/service/
 * Author: alexeygara
 * Last modified: 2026-02-11 14:32
 */

export type GameProcessDTO = string;

export type StoredGameProcessKey = string;

export interface IGameStoreService {

	storeGameProcess(gameDataJson:GameProcessDTO):Promise<StoredGameProcessKey>;
}

export interface IGameRestoreService {

	restoreGameProcess(key:StoredGameProcessKey):Promise<GameProcessDTO>;
}

export type UserProfileDTO = string;

export type UserProgressData = [UserProfileDTO, StoredGameProcessKey];

export interface IUserProgressSaver {

	saveUserProgress(userProfileJson:UserProfileDTO, storedGameProcessKey:StoredGameProcessKey):Promise<void>;
}

export interface IUserProgressLoader {

	loadUserProgress():Promise<UserProgressData>;
}