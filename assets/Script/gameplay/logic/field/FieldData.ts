/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameFieldData.ts
 * Path: assets/Script/gameplay/logic/field/
 * Author: alexeygara
 * Last modified: 2026-02-03 23:05
 */

import type {
	Column,
	FieldDataRead,
	FieldDataWrite,
	Row,
	SectorPos
}                            from "game_api/logic-api";
import { FieldDataIterable } from "game/logic/field/FieldDataIterable";

export abstract class FieldData<TSectorData, TEmptySector> implements FieldDataRead<TSectorData, TEmptySector>,
																	  FieldDataWrite<TSectorData> {

	/** Count of lines, from bottom to top.  */
	readonly rows:Row;

	/** Count of columns, from left to right. */
	readonly columns:Column;

	/**
	 * All sectors raw-data as a readonly 2D-array [rowIndex][columnIndex].
	 * <br/>**WARNING:** Each sector's position 'rowIndex' and 'columnIndex' starts with 1, not 0.
	 */
	get raw():Readonly<(TSectorData | TEmptySector)[][]> {
		return this._raw;
	}

	/**
	 * A list of all sectors positions. Sector position is a [rowIndex, columnIndex] tuple.
	 * <br/>**WARNING:** Each sector's position 'rowIndex' and 'columnIndex' starts with 1, not 0.
	 * The order is: 1-st row's columns, 2-nd row's columns, etc.
	 */
	get sectors():Readonly<SectorPos[]> {
		// WARNING: please keep this standalone implementation for order:
		// 1-st row's columns, 2-nd row's columns, etc.
		// (do not reuse data's iterable object, because its output order may be completely different)
		return Array(this.rows * this.columns)
		.fill(this._emptySectorValue)
		.map((_, index) => {
			const row:Row = Math.ceil((index + 1) / this.columns);
			const column:Column = (index + 1) - (row - 1) * this.columns;
			return [row, column];
		});
	}

	/**
	 * An iterable object for get access to all sectors data at one line iteration cycle.
	 */
	get data():Readonly<Iterable<[TSectorData | TEmptySector, SectorPos]>> {
		return this._iterationAgent;
	}

	/**
	 * All sectors raw-data as 2D-array [rowIndex][columnIndex].
	 * @private
	 */
	private readonly _raw:(TSectorData | TEmptySector)[][];
	private readonly _emptySectorValue:TEmptySector;
	private readonly _iterationAgent:Iterable<[TSectorData | TEmptySector, SectorPos]>;

	protected constructor(
		rowsCount:number,
		columnsCount:number,
		emptySectorValue:TEmptySector,
		iterationAgent?:Iterable<[TSectorData | TEmptySector, SectorPos]>
	) {
		this._emptySectorValue = emptySectorValue;
		this.rows = rowsCount | 0;
		this.columns = columnsCount | 0;
		this._raw = Array(this.rows).fill(this._emptySectorValue)
									.map(() => Array(this.columns)
									.fill(this._emptySectorValue));
		this._iterationAgent = iterationAgent || new FieldDataIterable(this);
	}

	clear():void {
		for(const [data, [row, column]] of this.data) {
			if(data !== this._emptySectorValue) {
				this._setRawData(row, column, this._emptySectorValue);
			}
		}
	}

	removeData(pos:SectorPos):boolean;
	removeData(row:Row, column:Column):boolean;
	removeData(arg1:Row | SectorPos, arg2?:Column):boolean {
		const [row, column] = this._resolvePos(arg1, arg2);

		if(this._getRawData(row, column) == this._emptySectorValue) {
			return false;
		}

		this._setRawData(row, column, this._emptySectorValue);

		return true;
	}

	setDataAt(pos:SectorPos, block:TSectorData):void;
	setDataAt(row:Row, column:Column, block:TSectorData):void;
	setDataAt(arg1:Row | SectorPos, arg2:Column | TSectorData, block?:TSectorData):void {
		let [row, column] = [0, 0];
		if(typeof block === 'undefined') {
			block = arg2 as TSectorData;
			[row, column] = this._resolvePos(arg1 as SectorPos);
		}
		else {
			[row, column] = this._resolvePos(arg1 as Row, arg2 as Column);
		}

		this._setRawData(row, column, block);
	}

	hasDataAt(pos:SectorPos):boolean;
	hasDataAt(row:Row, column:Column):boolean;
	hasDataAt(arg1:Row | SectorPos, arg2?:Column):boolean {
		const [row, column] = this._resolvePos(arg1, arg2);

		return this._getRawData(row, column) != this._emptySectorValue;
	}

	getDataAt(pos:SectorPos):TSectorData | TEmptySector;
	getDataAt(row:Row, column:Column):TSectorData | TEmptySector;
	getDataAt(arg1:Row | SectorPos, arg2?:Column):TSectorData | TEmptySector {
		const [row, column] = this._resolvePos(arg1, arg2);

		return this._getRawData(row, column);
	}

	getSectorsAround(pos:SectorPos, includeDiagonals?:boolean):SectorPos[];
	getSectorsAround(row:Row, column:Column, includeDiagonals?:boolean):SectorPos[];
	getSectorsAround(arg1:Row | SectorPos, arg2?:Column | boolean, includeDiagonals?:boolean):SectorPos[] {
		let row:Row;
		let col:Column;
		if(typeof arg2 === 'boolean') {
			includeDiagonals = arg2;
			[row, col] = this._resolvePos(arg1);
		}
		else {
			[row, col] = this._resolvePos(arg1, arg2);
		}

		const result:SectorPos[] = [];

		let index = 0;
		if(row > 1) {
			result[index++] = [row - 1, col];
		}
		if(row < this.rows) {
			result[index++] = [row + 1, col];
		}
		if(col > 1) {
			result[index++] = [row, col - 1];
		}
		if(col < this.columns) {
			result[index++] = [row, col + 1];
		}
		if(includeDiagonals) {
			if(row > 1 && col > 1) {
				result[index++] = [row - 1, col - 1];
			}
			if(row > 1 && col < this.columns) {
				result[index++] = [row - 1, col + 1];
			}
			if(row < this.rows && col < this.columns) {
				result[index++] = [row + 1, col + 1];
			}
			if(row < this.rows && col > 1) {
				result[index++] = [row + 1, col - 1];
			}
		}

		return result;
	}

	private _resolvePos(arg1:Row | SectorPos, arg2?:Column):SectorPos {
		if(typeof arg1 === "number") {
			return [arg1, arg2!];
		}

		return arg1;
	}

	private _getRawData(row:Row, column:Column):TSectorData | TEmptySector {
		return this._raw[row - 1][column - 1];
	}

	private _setRawData(row:Row, column:Column, data:TSectorData | TEmptySector):void {
		this._raw[row - 1][column - 1] = data;
	}

}