/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: RocketActivator.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/special/
 * Author: alexeygara
 * Last modified: 2026-02-04 19:59
 */

import { RocketType } from "game/logic/blocks/special/RocketType";
import type {
	BlocksFieldData,
	SectorPos,
	SectorsWave,
	SpecialBlockActivator
}                     from "game_api/logic-api";

export class RocketActivator implements SpecialBlockActivator {

	private readonly _direction:RocketType;
	private readonly _lineDistance:number;

	constructor(
		direction:RocketType,
		lineDistance:number,
	) {
		this._direction = direction;
		this._lineDistance = lineDistance;
	}

	activateBlocks(pos:SectorPos, field:BlocksFieldData, markSectorActivated:(pos:SectorPos) => boolean):SectorsWave {
		const resultWave:SectorPos[] = [];

		const sectors:SectorPos[] = [pos];
		const sectorsMap:boolean[][] = [];

		const lineDepth = this._lineDistance || Math.max(field.rows, field.columns);

		for(let depthIndex = 1; depthIndex <= lineDepth; depthIndex++) {
			if(!sectors.length) {
				break;
			}

			const sectorsCopy = sectors.splice(0, sectors.length);

			for(const pos of sectorsCopy) {
				const lineAroundSectors = this._getAroundLineSectors(pos, field);

				for(const nearSector of lineAroundSectors) {
					if(markSectorActivated(nearSector)) {
						// sector is not marked yet
						resultWave.push(nearSector);
					}

					// The rocket should collapse the entire line, through even empty sectors.

					const [row, col] = nearSector;
					sectorsMap[row] ||= [];

					if(!sectorsMap[row][col]) {
						sectors.push(nearSector);
						sectorsMap[row][col] = true;
					}
				}
			}
		}

		return resultWave;
	}

	private _getAroundLineSectors(pos:SectorPos, field:BlocksFieldData):SectorPos[] {

		const [row, col] = pos;

		switch(this._direction) {
			case RocketType.HORIZONTAL:
				if(col == 1) {
					// only right sector
					return [[row, col + 1]];
				}
				if(col == field.columns) {
					// only left sector
					return [[row, col - 1]];
				}
				return [[row, col - 1], [row, col + 1]];

			case RocketType.VERTICAL:
				if(row == 1) {
					// only top sector
					return [[row + 1, col]];
				}
				if(row == field.rows) {
					// only bottom sector
					return [[row - 1, col]];
				}
				return [[row - 1, col], [row + 1, col]];

			case RocketType.DIAGONAL_TL_BR:
				if(row == field.rows || col == 1) {
					// only bottom-right sector
					return [[row - 1, col + 1]];
				}
				if(row == 1 || col == field.columns) {
					// only top-left sector
					return [[row + 1, col - 1]];
				}
				return [
					// top-left sector
					[row + 1, col - 1],
					// bottom-right sector
					[row - 1, col + 1]
				];

			case RocketType.DIAGONAL_TR_BL:
				if(row == field.rows || col == field.columns) {
					// only bottom-left sector
					return [[row - 1, col - 1]];
				}
				if(row == 1 || col == 1) {
					// only top-right sector
					return [[row + 1, col + 1]];
				}
				return [
					// top-right sector
					[row + 1, col + 1],
					// bottom-left sector
					[row - 1, col - 1]
				];

			default:
				assertNever(this._direction);
		}
	}

}