/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: FallDowToBlocksMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-09 12:50
 */

import { isBlockTypeData } from "game/logic/blocks/BlocksField";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	SectorPos,
	SectorsWaves
}                          from "game_api/logic-api";

export class FallDownToBlocksMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _fallFromMethod:BlocksDataMethod;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		fallFromMethod:BlocksDataMethod,
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._fallFromMethod = fallFromMethod;
	}

	execute():SectorsWaves {
		const fallWaves:SectorsWaves = this._fallFromMethod.execute();

		const result:SectorPos[][] = [];

		for(let waveIndex = 0; waveIndex < fallWaves.length; waveIndex++) {
			const wave = fallWaves[waveIndex];
			result[waveIndex] ||= [];

			for(let posIndex = 0; posIndex < wave.length; posIndex++) {
				const [row, col] = wave[posIndex];
				const field = this._fieldProvider();

				const minEmptyPos:Writeable<SectorPos> = [row - 1, col];
				for(let rowIndex = minEmptyPos[0]; rowIndex >= 1; rowIndex--) {
					if(field.hasDataAt(rowIndex, col)) {
						break;
					}
					minEmptyPos[0] = rowIndex;
				}

				result[waveIndex][posIndex] = minEmptyPos;
				const block = field.getDataAt(row, col);
				if(isBlockTypeData(block)) {
					this._fieldEditor.removeData(row, col);
					this._fieldEditor.setDataAt(minEmptyPos, block);
				}
			}
		}

		return result;
	}

}