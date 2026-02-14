/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BlockActionBase.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/
 * Author: alexeygara
 * Last modified: 2026-02-04 17:30
 */

import type {
	BlocksFieldData,
	BlockType,
	Column,
	IBlockAction,
	Row,
	SectorPos,
	SectorsWaves
} from "game_api/logic-api";

export abstract class BlockActionBase<TBlockType extends BlockType>
	implements IBlockAction<TBlockType> {

	readonly blockType:TBlockType;

	/**
	 * List of all available (included) sectors as 2D-array.
	 * First index is not a Row, and starts with 0 (not 1).
	 * Second index is not a Column, and start with 0 (not 1).
	 */
	private _includedSectors:(true | undefined)[][];

	protected constructor(
		blockType:TBlockType
	) {
		this.blockType = blockType;
		this._includedSectors = [];
	}

	abstract action(field:BlocksFieldData, pos:SectorPos):SectorsWaves;

	protected resetIncludedSectors(rows:Row, columns:Column):void {
		this._includedSectors = Array(rows).fill(undefined)
										   .map(() => Array(columns).fill(undefined));
	}

	protected markSectorAsIncluded = (pos:SectorPos):boolean => {
		const [row, col] = pos;

		if(this._includedSectors[row - 1][col - 1]) {
			return false;
		}

		this._includedSectors[row - 1][col - 1] = true;

		return true;
	};

}