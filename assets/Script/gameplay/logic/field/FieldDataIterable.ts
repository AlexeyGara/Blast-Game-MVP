/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: FieldDataIterable.ts
 * Path: assets/Script/gameplay/logic/field/
 * Author: alexeygara
 * Last modified: 2026-02-08 23:39
 */

import type {
	Column,
	FieldDataRead,
	Row,
	SectorPos
} from "game_api/logic-api";

export class FieldDataIterable<TSectorData, TEmptySector> implements Iterable<[TSectorData | TEmptySector, SectorPos]> {

	private _fieldData:FieldDataRead<TSectorData, TEmptySector>;

	constructor(
		fieldData:FieldDataRead<TSectorData, TEmptySector>
	) {
		this._fieldData = fieldData;
	}

	[Symbol.iterator]():Iterator<[TSectorData | TEmptySector, SectorPos]> {
		const rowsCount = this._fieldData.rows;
		const columnsCount = this._fieldData.columns;
		const last = rowsCount * columnsCount;
		const current = ():number => (currentRow - 1) * columnsCount + currentCol;
		let currentRow = 1;
		let currentCol = 1;
		const getData = (row:Row, col:Column):TSectorData | TEmptySector => this._fieldData.getDataAt(row, col);

		return {
			next():IteratorResult<[TSectorData | TEmptySector, SectorPos]> {
				if(currentCol > columnsCount) {
					currentCol = 1;
					currentRow++;
				}

				if(current() > last) {
					return { done: true, value: undefined };
				}

				return { done: false, value: [getData(currentRow, currentCol), [currentRow, currentCol++]] };
			}
		};
	}
}