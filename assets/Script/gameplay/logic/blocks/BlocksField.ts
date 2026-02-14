/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: BlocksField.ts
 * Path: assets/Script/gameplay/logic/blocks/
 * Author: alexeygara
 * Last modified: 2026-02-02 01:49
 */

import { FieldData } from "game/logic/field/FieldData";
import type {
	BlocksFieldData,
	BlocksFieldEditor,
	BlockType,
	BoardSize,
	Column,
	EmptySector,
	IHaveEmptyRowsAtColumns,
	Row
}                    from "game_api/logic-api";

const emptySectorValue:EmptySector = -1;

export const isBlockTypeData
				 = (sectorData:BlockType | EmptySector):sectorData is BlockType => sectorData != emptySectorValue;

export class BlocksField extends FieldData<BlockType, EmptySector> implements BlocksFieldData,
																			  BlocksFieldEditor,
																			  IHaveEmptyRowsAtColumns {

	constructor(
		boardSize:BoardSize
	) {
		super(boardSize.rowsCount,
			  boardSize.columnsCount,
			  emptySectorValue);
	}

	getEmptyRowsAtColumn(column:Column, reverseTopDownOrder?:boolean):Row[] {
		const result:Row[] = [];

		if(reverseTopDownOrder) {
			for(let rowIndex:Row = 1; rowIndex <= this.rows; rowIndex++) {
				if(!this.hasDataAt(rowIndex, column)) {
					result.push(rowIndex);
				}
			}
		}
		else {
			for(let rowIndex:Row = this.rows; rowIndex >= 1; rowIndex--) {
				if(this.hasDataAt(rowIndex, column)) {
					break;
				}
				result.push(rowIndex);
			}
		}

		return result;
	}

}