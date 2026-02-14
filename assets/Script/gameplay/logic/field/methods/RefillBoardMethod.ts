/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: DropDownBlocksMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-05 12:54
 */

import type { BlockColorType }   from "game/logic/blocks/BlockColorType";
import { BlockColorTypes }       from "game/logic/blocks/BlockColorType";
import { BlockSpecialType }      from "game/logic/blocks/BlockSpecialType";
import type { LevelSettingsDTO } from "game_api/level-settings";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	SectorPos,
	SectorsWave,
	SectorsWaves
}                                from "game_api/logic-api";

/**
 * Fill the empty sectors of game-board with a new blocks that will drop down from the top of game-board.
 */
export class RefillBoardMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _settings:LevelSettingsDTO;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		settings:LevelSettingsDTO
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._settings = settings;
	}

	execute():SectorsWaves {

		const field = this._fieldProvider();

		const emptySectors:SectorPos[] = field.sectors.filter(
			(sector:SectorPos) => !field.hasDataAt(sector));

		let specialBlocksAvailable = Math.round(
			emptySectors.length * this._settings.process.fillRules.MAX_SPECIAL_BLOCKS_COUNT_MULTIPLIER * Math.random()
		);
		const specialBlocksChanceMap = this._generateSpecialBlocksChanceMap(
			new Map([
						[BlockSpecialType.BOMB, this._settings.process.fillRules.BOMB_CHANCE],
						[BlockSpecialType.BOMB_MAX, this._settings.process.fillRules.BOMB_MAX_CHANCE],
						[BlockSpecialType.ROCKET_VERTICAL, this._settings.process.fillRules.ROCKET_VERTICAL_CHANCE],
						[BlockSpecialType.ROCKET_HORIZONTAL, this._settings.process.fillRules.ROCKET_HORIZONTAL_CHANCE],
					])
		);

		let simpleBlocksAvailable = emptySectors.length - specialBlocksAvailable;
		let simpleWavesAvailable = 1 + Math.round(
			(this._settings.behaviour.MAX_COUNT_FOR_SIMPLE_BLOCKS_FILL_WAVES - 1) * Math.random()
		);

		const waves:Writeable<SectorsWaves> = [];

		// generate fill-waves with simple blocks
		while(simpleWavesAvailable > 0 && emptySectors.length) {
			const blocksCount = simpleWavesAvailable > 1
								? 1 + Math.round(((simpleBlocksAvailable - 1) / simpleWavesAvailable) * Math.random())
								: simpleBlocksAvailable;

			simpleBlocksAvailable -= blocksCount;

			waves.push(this._generateWaveOfSimpleBlocks(blocksCount, emptySectors));

			simpleWavesAvailable--;
		}

		// generate fill-waves with special blocks (each block as wave)
		while(specialBlocksAvailable > 0 && emptySectors.length) {
			waves.push(this._generateWaveOfSpecialBlocks(1, emptySectors, specialBlocksChanceMap));

			specialBlocksAvailable--;
		}

		return waves;

	}

	private _generateWaveOfSimpleBlocks(blocksCount:number, availableSectors:SectorPos[]):SectorsWave {

		const wave:Writeable<SectorsWave> = [];

		while(blocksCount > 0 && availableSectors.length) {
			const block = this._getRandomColorBlock();
			const sector = this._pickRandomSectorForSimpleBlock(/*block, */availableSectors/*, field*/);

			wave.push(sector);
			this._fieldEditor.setDataAt(...sector, block);

			blocksCount--;
		}

		return wave;
	}

	private _generateWaveOfSpecialBlocks(blocksCount:1, availableSectors:SectorPos[],
										 specialBlocksChanceMap:BlockSpecialType[]):SectorsWave {

		const wave:Writeable<SectorsWave> = [];

		while(blocksCount > 0 && availableSectors.length) {
			const block = this._getRandomSpecialBlock(specialBlocksChanceMap);
			const sector = this._pickRandomSectorForSpecialBlock(/*block, */availableSectors/*, field*/);

			wave.push(sector);
			this._fieldEditor.setDataAt(...sector, block);

			blocksCount--;
		}

		return wave;
	}

	private _getRandomColorBlock():BlockColorType {
		return BlockColorTypes[Math.floor(BlockColorTypes.length * Math.random())] as BlockColorType;
	}

	private _generateSpecialBlocksChanceMap(chanceByTypes:Map<BlockSpecialType, number>):BlockSpecialType[] {

		const result:BlockSpecialType[] = [];

		for(const specialType of chanceByTypes.keys()) {

			const chanceCount = Math.round(1 / chanceByTypes.get(specialType)!);

			result.push(...Array(chanceCount).fill(specialType));
		}

		return result;
	}

	private _getRandomSpecialBlock(specialBlocksChanceMap:BlockSpecialType[]):BlockSpecialType {

		return specialBlocksChanceMap[Math.floor(specialBlocksChanceMap.length * Math.random())] as BlockSpecialType;
	}

	private _pickRandomSectorForSimpleBlock(
		//blockColor:EBlockColor,
		availableSectors:SectorPos[],
		//field:GameFieldData
	):SectorPos {
		const index = Math.floor(availableSectors.length * Math.random());
		return availableSectors.splice(index, 1)[0];
	}

	private _pickRandomSectorForSpecialBlock(
		//blockColor:EBlockSpecial,
		availableSectors:SectorPos[],
		//field:GameFieldData
	):SectorPos {
		const index = Math.floor(availableSectors.length * Math.random());
		return availableSectors.splice(index, 1)[0];
	}

}