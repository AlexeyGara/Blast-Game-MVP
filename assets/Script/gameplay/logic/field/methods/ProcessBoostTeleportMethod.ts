/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ProcessBoostTeleportMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-07 02:52
 */

import { isBlockTypeData } from "game/logic/blocks/BlocksField";
import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	SectorPos,
	SectorsWaves
}                          from "game_api/logic-api";

export class ProcessBoostTeleportMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _pickMethod:BlocksDataMethod;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		pickMethod:BlocksDataMethod
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._pickMethod = pickMethod;
	}

	execute():SectorsWaves {

		const pickWaves:SectorsWaves = this._pickMethod.execute();

		const resultWaves:SectorPos[][] = [];

		const fromSectors:SectorPos[] = [];
		const toSectors:SectorPos[] = [];

		const tmp:SectorPos[][] = [fromSectors, toSectors];
		let tmpSwitcher = 1;

		for(const wave of pickWaves) {
			for(const sector of wave) {
				tmp[tmpSwitcher ^= 1].push(sector);
			}
		}

		const couplesCount = Math.min(fromSectors.length, toSectors.length);

		for(let sectorIndex = 0; sectorIndex < couplesCount; sectorIndex++) {
			const pickSector = fromSectors[sectorIndex];
			const targetSector = toSectors[sectorIndex];

			const coupleWave:SectorPos[] = [pickSector, targetSector];

			resultWaves.push(coupleWave);

			const field = this._fieldProvider();

			const pickedBlock = field.getDataAt(pickSector);
			const targetBlock = field.getDataAt(targetSector);

			if(isBlockTypeData(pickedBlock) && isBlockTypeData(targetBlock)) {
				this._fieldEditor.setDataAt(targetSector, pickedBlock);
				this._fieldEditor.setDataAt(pickSector, targetBlock);
			}
		}

		return resultWaves;
	}

}