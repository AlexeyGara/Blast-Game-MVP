/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameProcessModel.ts
 * Path: assets/Script/gameplay/turn_cycle/
 * Author: alexeygara
 * Last modified: 2026-02-08 06:47
 */

import { GameplayBoostID }       from "game/boosts/BoostID";
import { GameStatus }            from "game/GameStatus";
import type {
	GameProcessResult,
	IGameProcessResultAgent
}                                from "game_api/game-api";
import type { LevelSettingsDTO } from "game_api/level-settings";
import type {
	GameBoosters,
	PlayerTurnResult
}                                from "game_api/logic-api";

export class GameProcessModel implements IGameProcessResultAgent,
										 GameProcessResult {

	get status():GameStatus {
		return this._status;
	}

	get totalScore():number {
		return this._totalScore;
	}

	get scoreToWin():number {
		return this._levelSettings.process.scoreToWin;
	}

	get turnsCompleted():number {
		return this._turnsCompleted;
	}

	get turnsLeft():number {
		return this._turnsLeft;
	}

	readonly boosters:GameBoosters;

	private _status:GameStatus = GameStatus.READY;
	private _totalScore:number = 0;
	private readonly _levelSettings:LevelSettingsDTO;
	private _turnsCompleted:number = 0;
	private _turnsLeft:number;

	constructor(
		levelSettings:LevelSettingsDTO
	) {
		this._levelSettings = levelSettings;

		this._turnsLeft = this._levelSettings.process.start.startTurnsCount;
		this.boosters = { ...this._levelSettings.process.start.startBoosters };
	}

	enterBooster(booster:GameplayBoostID):void {
		switch(booster) {
			case GameplayBoostID.TELEPORT:
				(this.boosters.teleport as Writeable<number>) = Math.max(0, this.boosters.teleport - 1);
				break;

			case GameplayBoostID.BOMB:
				(this.boosters.bomb as Writeable<number>) = Math.max(0, this.boosters.bomb - 1);
				break;

			default:
				assertNever(booster);
		}
	}

	setStatus(status:GameStatus):void {
		switch(this._status) {
			case GameStatus.READY:
			case GameStatus.CONTINUE:
				this._status = status;
				break;

			case GameStatus.WIN_STATUS:
			case GameStatus.LOSE_STATUS:
				break;

			default:
				assertNever(this._status);
		}
	}

	onStartTurn():Promise<void> {
		return Promise.resolve();
	}

	onBoostActivate():Promise<void> {
		return Promise.resolve();
	}

	onEndTurn():Promise<void> {
		this._turnsCompleted++;
		this._turnsLeft = Math.max(0, this._turnsLeft - 1);

		return Promise.resolve();
	}

	onCompleteResult(turnResult:PlayerTurnResult):Promise<void> {
		(this.boosters.teleport as Writeable<number>) += turnResult.reward.teleport;
		(this.boosters.bomb as Writeable<number>) += turnResult.reward.bomb;

		this._totalScore += turnResult.score;

		return Promise.resolve();
	}

}