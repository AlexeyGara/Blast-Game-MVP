/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerTurnModel.ts
 * Path: assets/Script/gameplay/logic/turn_cycle/
 * Author: alexeygara
 * Last modified: 2026-02-08 06:09
 */

import type { GameplayBoostID }        from "game/boosts/BoostID";
import type { IPlayerTurnResultAgent } from "game_api/game-api";
import type {
	GameBoosters,
	PlayerTurnResult,
	ScoreInfo,
	ScoresFieldData,
	ScoresFieldEditor,
	SectorPos,
	SectorsWaves
}                                      from "game_api/logic-api";

export class PlayerTurnModel implements IPlayerTurnResultAgent,
										PlayerTurnResult {

	get score():number {
		return this._score;
	}

	get scoreBySectors():Readonly<[ScoresFieldData, SectorsWaves]> {
		return [this._scoresFieldProvider(), this._scoreWaves];
	}

	get reward():GameBoosters {
		return this._reward;
	}

	private _score:number = 0;
	private _scoreWaves:Writeable<SectorsWaves> = [];
	private readonly _scoresFieldProvider:() => ScoresFieldData;
	private readonly _scoresFieldEditor:ScoresFieldEditor;
	private _reward:Writeable<GameBoosters> = {
		teleport: 0,
		bomb: 0
	};

	constructor(
		scoresFieldProvider:() => ScoresFieldData,
		scoresFieldEditor:ScoresFieldEditor
	) {
		this._scoresFieldProvider = scoresFieldProvider;
		this._scoresFieldEditor = scoresFieldEditor;
	}

	onStartTurn():Promise<void> {
		this._reset();

		return Promise.resolve();
	}

	onBoostActivate(boostId:GameplayBoostID):Promise<void> {
		//TODO: implement
		// we can increase/decrease score, blocks the same boost reward on the end of turn, etc.
		console.log(boostId);
		return Promise.resolve();
	}

	onEndTurn():Promise<void> {
		this._reset();

		return Promise.resolve();
	}

	onCompleteResult():Promise<void> {
		return Promise.resolve();
	}

	addScore(value:number):void {
		this._score += value;
	}

	addToScoreInfoValue(addScoreInfo:ScoreInfo, sector:SectorPos):void {
		const scoreInfo = this._scoresFieldProvider().getDataAt(sector);

		let score = scoreInfo ? scoreInfo[0] : 0;
		let isSpecial = scoreInfo ? scoreInfo[1] : false;

		score += addScoreInfo[0];
		isSpecial ||= addScoreInfo[1];

		this._scoresFieldEditor.setDataAt(sector, [score, isSpecial]);
	}

	setScoresWaves(waves:SectorsWaves):void {
		//destruct making a deep copy
		this._scoreWaves = [...waves.map((wave) => [...wave])];
	}

	addReward(reward:GameBoosters):void {
		this._reward = { ...reward };
	}

	private _reset():void {
		this._score = 0;
		this._scoreWaves.length = 0;
		this._scoresFieldEditor.clear();
		this._reward.teleport = 0;
		this._reward.bomb = 0;
	}

}