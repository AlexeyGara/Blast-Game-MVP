/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CalculateResultMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-04 02:19
 */

import { isBlockTypeData } from "game/logic/blocks/BlocksField";
import { isSpecialBlock }  from "game/logic/blocks/BlockSpecialType";
import type {
	IPlayerTurnResultAgent,
	RewardByScoreCalculator,
	ScoreCalculation,
	WaveIndex
}                          from "game_api/game-api";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	BlockType,
	IBlockAction,
	PlayerTurnResult,
	SectorPos,
	SectorsWave,
	SectorsWaves
}                          from "game_api/logic-api";

export class ProcessBlocksByInitialOneMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _playerTurnResultProvider:() => PlayerTurnResult;
	private readonly _playerTurnResultAgent:IPlayerTurnResultAgent;
	private readonly _blockActionStrategyProvider:(blockType:BlockType) => IBlockAction<BlockType>;
	private readonly _scoreCalculatorProvider:() => ScoreCalculation;
	private readonly _rewardCalculatorProvider:() => RewardByScoreCalculator;
	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _blockPosition:SectorPos;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		blockPosition:SectorPos,
		playerTurnResultProvider:() => PlayerTurnResult,
		playerTurnResultAgent:IPlayerTurnResultAgent,
		blockActionProvider:(blockType:BlockType) => IBlockAction<BlockType>,
		scoreCalculatorProvider:() => ScoreCalculation,
		rewardCalculatorProvider:() => RewardByScoreCalculator,
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._blockPosition = blockPosition;
		this._playerTurnResultProvider = playerTurnResultProvider;
		this._playerTurnResultAgent = playerTurnResultAgent;
		this._blockActionStrategyProvider = blockActionProvider;
		this._scoreCalculatorProvider = scoreCalculatorProvider;
		this._rewardCalculatorProvider = rewardCalculatorProvider;
	}

	execute():SectorsWaves {
		if(!this._blockPosition) {
			return [];
		}
		return this._calculate(this._fieldProvider(), this._blockPosition,
							   this._scoreCalculatorProvider());
	}

	private _calculate(field:BlocksFieldData, activeBlockPos:SectorPos,
					   scoreCalculator:ScoreCalculation):SectorsWaves {

		const waves:Writeable<SectorsWaves> = [];

		const blockType = field.getDataAt(activeBlockPos);
		//TODO: remove this checkup
		if(!isBlockTypeData(blockType)) {
			// It's impossible, but sector is empty
			return waves;
		}

		// 1-st and N-nd wave: process all waves ---> [
		const collapseWaves = this._blockActionStrategyProvider(blockType).action(field, activeBlockPos);

		let waveIndex = 1;
		for(const collapseWave of collapseWaves) {
			if(collapseWave.length) {
				waves.push(collapseWave);
			}

			for(const blockPos of collapseWave) {
				this._processBlock(blockPos, field, scoreCalculator);
			}

			this._processWave(collapseWave, waveIndex++, scoreCalculator);
		}

		this._playerTurnResultAgent.setScoresWaves(waves);
		// ] <---

		this._playerTurnResultAgent.addReward(
			this._rewardCalculatorProvider()(this._playerTurnResultProvider().score, collapseWaves));

		return waves;
	}

	/**
	 * Find the block type at the given position and calculate the scores for that block, if any.
	 * @param blockPos
	 * @param field
	 * @param scoreCalculator
	 * @private
	 */
	private _processBlock(blockPos:SectorPos, field:BlocksFieldData, scoreCalculator:ScoreCalculation):void {

		const sectorData = field.getDataAt(blockPos);
		if(!isBlockTypeData(sectorData)) {
			return;
		}

		this._fieldEditor.removeData(blockPos);

		const score = scoreCalculator.scoreByBlock(sectorData);
		this._playerTurnResultAgent.addScore(score);
		this._playerTurnResultAgent.addToScoreInfoValue([score, isSpecialBlock(sectorData)], blockPos);
	}

	/**
	 * Calculate the score for the specified wave of collapsing blocks and add that wave into the player's turn result-object.
	 * @param wave
	 * @param waveIndex Index of wave. The higher the index, the higher the additional points. Starts with 1, not 0.
	 * @param scoreCalculator
	 * @private
	 */
	private _processWave(wave:SectorsWave, waveIndex:WaveIndex, scoreCalculator:ScoreCalculation):void {

		if(!wave.length) {
			return;
		}

		const scoreInWave = scoreCalculator.scoreByWave(wave, waveIndex);
		this._playerTurnResultAgent.addScore(scoreInWave.reduce((acc, current) => acc + current, 0));

		for(let i = 0; i < wave.length; i++) {
			const blockPos = wave[i];
			this._playerTurnResultAgent.addToScoreInfoValue([scoreInWave[i], false], blockPos);
		}
	}

}