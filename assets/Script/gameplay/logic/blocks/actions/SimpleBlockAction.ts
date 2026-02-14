/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: SimpleBlockAction.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/
 * Author: alexeygara
 * Last modified: 2026-02-04 13:42
 */

import type {
	BlocksFieldData,
	SectorPos,
	SectorsWave,
	SectorsWaves
}                           from "game_api/logic-api";
import { BlockActionBase }     from "game/logic/blocks/actions/BlockActionBase";
import type { BlockColorType } from "game/logic/blocks/BlockColorType";
import { isSimpleBlock }       from "game/logic/blocks/BlockColorType";

//TODO: move to singleton gameplay settings
const INCLUDE_DIAGONALS = false;

export class SimpleBlockAction<TBlockColor extends BlockColorType> extends BlockActionBase<TBlockColor> {

	constructor(
		blockType:TBlockColor
	) {
		super(blockType);
	}

	action(field:BlocksFieldData, initPos:SectorPos):SectorsWaves {
		const wavesResult:Writeable<SectorsWaves> = [];

		if(!field.hasDataAt(initPos)) {
			return wavesResult;
		}

		const initBlockType = field.getDataAt(initPos);
		if(!isSimpleBlock(initBlockType) || initBlockType != this.blockType) {
			return wavesResult;
		}

		this.resetIncludedSectors(field.rows, field.columns);

		// 1-st wave: is the same active block-initiator
		if(this.markSectorAsIncluded(initPos)) {
			wavesResult.push([initPos]);
		}

		// 2-nd wave: are all same colored blocks around active block-initiator
		let wave = this._getSameColorBlocksAround(initPos, field);
		if(!wave.length) {
			return wavesResult;
		}
		wavesResult.push(wave);

		// N-nd waves: are all other same colored blocks around previous collapsed blocks
		while(true) {
			wave = this._getNextWave(wave, field);
			if(!wave.length) {
				return wavesResult;
			}
			wavesResult.push(wave);
		}
	}

	private _getNextWave(initWave:SectorsWave, field:BlocksFieldData):SectorsWave {
		const wave:SectorPos[] = [];

		for(const sector of initWave) {
			wave.push(...this._getSameColorBlocksAround(sector, field));
		}

		return wave;
	}

	private _getSameColorBlocksAround(pos:SectorPos, field:BlocksFieldData):SectorsWave {
		const aroundSectors = field.getSectorsAround(pos, INCLUDE_DIAGONALS);
		const result:SectorPos[] = [];

		for(const sector of aroundSectors) {
			const sectorData = field.getDataAt(sector);
			if(sectorData == this.blockType) {
				if(this.markSectorAsIncluded(sector)) {
					result.push(sector);
				}
			}
		}

		return result;
	}

}