/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: logic.ts
 * Path: assets/Script/gameplay/api/
 * Author: alexeygara
 * Last modified: 2026-02-02 21:59
 */

//TODO: remove dependencies to 'game'

import type { BlockColorType }   from "game/logic/blocks/BlockColorType";
import type { BlockSpecialType } from "game/logic/blocks/BlockSpecialType";

/** Index of column in blocks field data: starts from 1, increasing from left to right. */
export type Column = number;
/** Index of line in blocks field data: starts from 1, increasing from bottom to top. */
export type Row = number;

export type SectorPos = Readonly<[Row, Column]>;

export type BlockType = BlockColorType | BlockSpecialType;

export type EmptySector = -1;

export type FieldDataRead<TSectorData, TEmptySectorData> = {

	/** Count of lines, from bottom to top.  */
	readonly rows:Row;

	/** Count of columns, from left to right. */
	readonly columns:Column;

	/**
	 * All sectors raw-data as a readonly 2D-array [rowIndex][columnIndex].
	 * <br/>**WARNING:** Each sector's position 'rowIndex' and 'columnIndex' starts with 1, not 0.
	 */
	readonly raw:ReadonlyArray<ReadonlyArray<TSectorData | TEmptySectorData>>;

	/**
	 * A list of all sectors positions at one line array. Sector position is a [rowIndex, columnIndex] tuple.
	 * <br/>**WARNING:** Each sector's position 'rowIndex' and 'columnIndex' starts with 1, not 0.
	 * The order is: 1-st row's columns, 2-nd row's columns, etc.
	 */
	readonly sectors:Readonly<SectorPos[]>;

	/**
	 * An iterable object for get access to all sectors data at one line iteration cycle.
	 */
	readonly data:Readonly<Iterable<[TSectorData | TEmptySectorData, SectorPos]>>;

	hasDataAt(pos:SectorPos):boolean;
	hasDataAt(row:Row, column:Column):boolean;

	getDataAt(pos:SectorPos):TSectorData | TEmptySectorData;
	getDataAt(row:Row, column:Column):TSectorData | TEmptySectorData;

	getSectorsAround(pos:SectorPos, includeDiagonals?:boolean):SectorPos[];
	getSectorsAround(row:Row, column:Column, includeDiagonals?:boolean):SectorPos[];
}

export type FieldDataWrite<TSectorData> = {

	clear():void;

	removeData(pos:SectorPos):boolean;
	removeData(row:Row, column:Column):boolean;

	setDataAt(pos:SectorPos, data:TSectorData):void;
	setDataAt(row:Row, column:Column, data:TSectorData):void;
}

export type BlocksFieldData = FieldDataRead<BlockType, EmptySector>;

export type BlocksFieldEditor = FieldDataWrite<BlockType>;

export type BlocksDataMethod = {

	readonly blocksData:BlocksFieldData;

	/**
	 * Perform the process of counting collapsed or added blocks on the game board and return a list of sectors containing those blocks.
	 * @return A list of sectors (ordered by waves) of calculated blocks.
	 */
	execute():SectorsWaves;
}

export type ScoreValue = number;

export type ScoreIsSpecial = boolean;

export type ScoreInfo = [ScoreValue, ScoreIsSpecial];

export type ScoresFieldData = FieldDataRead<ScoreInfo, 0>;

export type ScoresFieldEditor = FieldDataWrite<ScoreInfo>;

export type SectorsWave = Readonly<SectorPos[]>;

export type SectorsWaves = Readonly<SectorsWave[]>;

export type GameBoosters = Readonly<{

	teleport:number;
	bomb:number;
}>;

export type PlayerTurnResult = Readonly<{

	score:number;
	scoreBySectors:Readonly<[ScoresFieldData, SectorsWaves]>;

	reward:GameBoosters;
}>;

export type IBlockAction<TBlockType extends BlockType> = {

	readonly blockType:TBlockType;

	action(field:BlocksFieldData, pos:SectorPos):SectorsWaves;
}

export type SpecialBlockActivator = {

	activateBlocks(initPos:SectorPos, field:BlocksFieldData,
				   markSectorActivated:(pos:SectorPos) => boolean):SectorsWave;
}

export type SpecialBlockActivatorProvider = (specBlockType:BlockSpecialType) => SpecialBlockActivator | null;

export interface IHaveEmptyRowsAtColumns {

	getEmptyRowsAtColumn(column:Column, reverseTopDownOrder?:boolean):Row[];
}

export type BoardSize = {

	readonly rowsCount:number;

	readonly columnsCount:number;
}