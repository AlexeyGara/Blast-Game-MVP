/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GetFallDownBlocksMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-05 12:53
 */

import type {
	BlocksDataMethod,
	BlocksFieldData,
	SectorPos,
	SectorsWaves
} from "game_api/logic-api";

/**
 * Fill the empty game-board sectors with blocks that will fall from sectors above.
 */
export class FallDownFromBlocksMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;

	constructor(
		fieldProvider:() => BlocksFieldData
	) {
		this._fieldProvider = fieldProvider;
	}

	execute():SectorsWaves {

		const fallWaves:SectorPos[][] = [];

		const field = this._fieldProvider();

		for(let colIndex = 1; colIndex <= field.columns; colIndex++) {
			let emptyLast = false;
			let waveIndex = -1;

			for(let rowIndex = 1; rowIndex <= field.rows; rowIndex++) {
				if(!field.hasDataAt(rowIndex, colIndex)) {
					emptyLast = true;
				}
				else {
					if(emptyLast || waveIndex >= 0) {
						if(!emptyLast) {
							waveIndex++;
						}
						waveIndex = Math.max(0, waveIndex);
						fallWaves[waveIndex] ||= [];
						fallWaves[waveIndex].push([rowIndex, colIndex]);
					}

					emptyLast = false;
				}
			}

		}

		return fallWaves;
	}

}