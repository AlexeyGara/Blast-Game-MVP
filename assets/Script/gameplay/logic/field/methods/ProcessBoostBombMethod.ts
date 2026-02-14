/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ProcessBoostBombMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-07 02:53
 */

import type { BlockColorType } from "game/logic/blocks/BlockColorType";
import { isSimpleBlock }       from "game/logic/blocks/BlockColorType";
import { isBlockTypeData }     from "game/logic/blocks/BlocksField";
import { isSpecialBlock }      from "game/logic/blocks/BlockSpecialType";
import type {
	IPlayerTurnResultAgent,
	RewardByScoreCalculator,
	ScoreCalculation
}                              from "game_api/game-api";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	BlockType,
	PlayerTurnResult,
	SectorPos,
	SectorsWaves
}                              from "game_api/logic-api";

export class ProcessBoostBombMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _playerTurnResultProvider:() => PlayerTurnResult;
	private readonly _playerTurnResultAgent:IPlayerTurnResultAgent;
	private readonly _scoreCalculatorProvider:() => ScoreCalculation;
	private readonly _rewardCalculatorProvider:() => RewardByScoreCalculator;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		playerTurnResultProvider:() => PlayerTurnResult,
		playerTurnResultAgent:IPlayerTurnResultAgent,
		scoreCalculatorProvider:() => ScoreCalculation,
		rewardCalculatorProvider:() => RewardByScoreCalculator,
	) {
		this._playerTurnResultProvider = playerTurnResultProvider;
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._playerTurnResultAgent = playerTurnResultAgent;
		this._scoreCalculatorProvider = scoreCalculatorProvider;
		this._rewardCalculatorProvider = rewardCalculatorProvider;
	}

	execute():SectorsWaves {

		const field = this._fieldProvider();

		const [blocksByType, countByType] = this._analyseGameField(field);

		let blockTypeToActivate:BlockColorType;
		let lastCount = 0;
		for(const blockType of countByType.keys()) {
			if(isSimpleBlock(blockType)) {
				const count = countByType.get(blockType)!;

				if(count > lastCount) {
					lastCount = count;
					blockTypeToActivate = blockType;
				}
			}
		}

		const resultWaves:Writeable<SectorsWaves> = [];

		const scoreCalculator = this._scoreCalculatorProvider();

		const sectorsToActivate = blocksByType.get(blockTypeToActivate!)!;
		for(const sector of sectorsToActivate) {

			const eachSectorWave = [sector];

			resultWaves.push(eachSectorWave);

			const sectorData = field.getDataAt(sector);

			if(isBlockTypeData(sectorData)) {

				const score = scoreCalculator.scoreByBlock(sectorData);

				this._playerTurnResultAgent.addScore(score);
				this._playerTurnResultAgent.addToScoreInfoValue([score, isSpecialBlock(sectorData)], sector);

				const scoreInWave = scoreCalculator.scoreByWave(eachSectorWave, resultWaves.length);

				this._playerTurnResultAgent.addScore(scoreInWave.reduce((acc, current) => acc + current, 0));

				for(let i = 0; i < eachSectorWave.length; i++) {
					const blockPos = eachSectorWave[i];
					this._playerTurnResultAgent.addToScoreInfoValue([scoreInWave[i], false], blockPos);
				}
			}

			this._fieldEditor.removeData(sector);
		}

		this._playerTurnResultAgent.setScoresWaves(resultWaves);


		const reward = this._rewardCalculatorProvider()(this._playerTurnResultProvider().score, resultWaves);
		//do not add reward for this boost kind
		//this._playerTurnResultAgent.addReward(reward);
		console.log(reward);

		return resultWaves;
	}

	private _analyseGameField(field:BlocksFieldData):[Map<BlockType, SectorPos[]>, Map<BlockType, number>] {

		const blocksByType = new Map<BlockType, SectorPos[]>();
		const countByType = new Map<BlockType, number>();

		for(const [data, sector] of field.data) {
			if(isBlockTypeData(data)) {
				const sectors = blocksByType.get(data) || [];
				let count = countByType.get(data) || 0;

				sectors.push(sector);
				count++;

				blocksByType.set(data, sectors);
				countByType.set(data, count);
			}
		}

		return [blocksByType, countByType];
	}

}