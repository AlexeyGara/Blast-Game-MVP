/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: SpecialBlockAction.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/
 * Author: alexeygara
 * Last modified: 2026-02-04 13:46
 */

import { BlockActionBase }       from "game/logic/blocks/actions/BlockActionBase";
import type { BlockSpecialType } from "game/logic/blocks/BlockSpecialType";
import { isSpecialBlock }        from "game/logic/blocks/BlockSpecialType";
import type {
	BlocksFieldData,
	SectorPos,
	SectorsWave,
	SectorsWaves,
	SpecialBlockActivator,
	SpecialBlockActivatorProvider
}                                from "game_api/logic-api";

export class SpecialBlockAction<TBlockType extends BlockSpecialType> extends BlockActionBase<TBlockType> {

	private readonly _currActivator:SpecialBlockActivator;
	private readonly _otherActivatorsProvider?:SpecialBlockActivatorProvider;

	constructor(
		blockType:TBlockType,
		currActivator:SpecialBlockActivator,
		otherActivatorsProvider?:SpecialBlockActivatorProvider
	) {
		super(blockType);
		this._currActivator = currActivator;
		this._otherActivatorsProvider = otherActivatorsProvider;
	}

	action(field:BlocksFieldData, initPos:SectorPos):SectorsWaves {
		const wavesResult:Writeable<SectorsWaves> = [];

		if(!field.hasDataAt(initPos)) {
			return wavesResult;
		}

		const initBlockType = field.getDataAt(initPos);
		if(!isSpecialBlock(initBlockType) || initBlockType != this.blockType) {
			return wavesResult;
		}

		this.resetIncludedSectors(field.rows, field.columns);

		// 1-st wave: the same current active special-block
		if(this.markSectorAsIncluded(initPos)) {
			wavesResult.push([initPos]);
		}

		// 2-nd wave: all blocks collapsed by current active special-block
		let wave = this._currActivator.activateBlocks(initPos, field, this.markSectorAsIncluded);
		if(!wave.length) {
			return wavesResult;
		}
		wavesResult.push(wave);

		if(!this._otherActivatorsProvider) {
			return wavesResult;
		}

		// N-nd waves: all blocks collapsed by other activated special-blocks
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

		for(const nextInitPos of initWave) {
			const blockType = field.getDataAt(nextInitPos);

			if(isSpecialBlock(blockType)) {
				const activator = this._otherActivatorsProvider?.(blockType);

				if(activator) {
					wave.push(...activator.activateBlocks(nextInitPos, field, this.markSectorAsIncluded));
				}
			}
		}

		return wave;
	}

}