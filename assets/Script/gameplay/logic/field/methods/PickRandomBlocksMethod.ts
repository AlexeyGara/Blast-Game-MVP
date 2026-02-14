/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ShakeFromBlocksMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-11 09:35
 */

import { isBlockTypeData } from "game/logic/blocks/BlocksField";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlockType,
	SectorPos,
	SectorsWave,
	SectorsWaves
}                          from "game_api/logic-api";

type PickOptions = {
	/** Default is 1. Will be default if not set or set to 0. */
	blocksToPickMin:number;
	/** Will be max (rows * columns) if set to 0. */
	blocksToPickMax:number;
	/** Will be 1 if set to 0. */
	maxBlocksAtOneWave:number;
};

export class PickRandomBlocksMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _blockTypeFilter?:(blockType:BlockType) => boolean;
	private readonly _options:PickOptions = {
		blocksToPickMin: 0,
		blocksToPickMax: 0,
		maxBlocksAtOneWave: 0
	};

	constructor(
		fieldProvider:() => BlocksFieldData,
		options:PickOptions,
		blockTypeFilter?:(blockType:BlockType) => boolean,
	) {
		this._fieldProvider = fieldProvider;
		this._blockTypeFilter = blockTypeFilter;
		this._initPickOptions(this._fieldProvider(), options);
	}

	private _initPickOptions(field:BlocksFieldData, options:PickOptions):void {

		const maxBlocksCount = field.rows * field.columns;

		if(!options.blocksToPickMin) {
			this._options.blocksToPickMin = 1;
		}
		else {
			this._options.blocksToPickMin = Math.max(1, Math.min(maxBlocksCount, options.blocksToPickMin));
		}

		if(!options.blocksToPickMax) {
			this._options.blocksToPickMax = maxBlocksCount;
		}
		else {
			this._options.blocksToPickMax = Math.max(1, Math.min(maxBlocksCount, options.blocksToPickMax));
		}

		if(!options.maxBlocksAtOneWave) {
			this._options.maxBlocksAtOneWave = 1;
		}
		else {
			this._options.maxBlocksAtOneWave = Math.max(1, Math.min(maxBlocksCount, options.maxBlocksAtOneWave));
		}
	}

	execute():SectorsWaves {

		const field = this._fieldProvider();

		const waves:Writeable<SectorsWaves> = [];
		let wave:Writeable<SectorsWave> = [];

		const maxBlocksCountToPick = this._options.blocksToPickMin +
									 Math.round(
										 (this._options.blocksToPickMax - this._options.blocksToPickMin) *
										 Math.random());

		const availableSectors = field.sectors as SectorPos[];
		let pickedBlocksCount = 0;

		while(availableSectors.length && pickedBlocksCount < maxBlocksCountToPick) {
			const [row, col] = this._getRandomSector(availableSectors);

			const sectorData = field.getDataAt(row, col);
			if(isBlockTypeData(sectorData) &&
			   (!this._blockTypeFilter || this._blockTypeFilter(sectorData))) {

				pickedBlocksCount++;

				wave.push([row, col]);

				const maxWaveLength = 1 + Math.round((this._options.maxBlocksAtOneWave - 1) * Math.random());
				if(wave.length >= maxWaveLength) {
					waves.push(wave);
					wave = [];
				}
			}
		}

		return waves;
	}

	private _getRandomSector(availableSectors:SectorPos[]):SectorPos {

		const pickIndex = (availableSectors.length * Math.random()) | 0;

		return availableSectors.splice(pickIndex, 1)[0];
	}

}