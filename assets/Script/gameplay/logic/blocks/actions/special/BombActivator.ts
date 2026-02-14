/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BombActivator.ts
 * Path: assets/Script/gameplay/logic/blocks/actions/special/
 * Author: alexeygara
 * Last modified: 2026-02-04 19:32
 */

import type {
	BlocksFieldData,
	SectorPos,
	SectorsWave,
	SpecialBlockActivator
} from "game_api/logic-api";

/**
 * Calculate all blocks activated (will be 'exploded') by the bomb.
 */
export class BombActivator implements SpecialBlockActivator {

	private readonly _waveRadius:number;
	private readonly _includeDiagonals:boolean;

	constructor(
		waveRadius:number,
		includeDiagonals:boolean
	) {
		this._waveRadius = waveRadius;
		this._includeDiagonals = includeDiagonals;
	}

	activateBlocks(initPos:SectorPos, field:BlocksFieldData, markSectorActivated:(pos:SectorPos) => boolean):SectorsWave {
		const resultWave:SectorPos[] = [];

		const sectors:SectorPos[] = [initPos];
		const sectorsMap:boolean[][] = [];

		const waveDepth = this._waveRadius || Math.max(field.rows, field.columns);

		for(let depthIndex = 1; depthIndex <= waveDepth; depthIndex++) {
			if(!sectors.length) {
				// where are no sectors to spread the wave
				break;
			}

			const sectorsCopy = sectors.splice(0, sectors.length);

			for(const pos of sectorsCopy) {
				const aroundSectors = field.getSectorsAround(pos, this._includeDiagonals);

				for(const nearSector of aroundSectors) {
					if(markSectorActivated(nearSector)) {
						// sector is not marked yet
						resultWave.push(nearSector);
					}

					// The bomb's blast wave should spread through even empty sectors.

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
}