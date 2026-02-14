/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: calculation-score-by-wave.ts
 * Path: assets/Script/gameplay/logic/score/calculation/
 * Author: alexeygara
 * Last modified: 2026-02-07 04:17
 */

import type {
	ScoreBonusByWaveCalculator,
	WaveIndex
}                           from "game_api/game-api";
import type { SectorsWave } from "game_api/logic-api";

//TODO: move to singleton gameplay settings
const SCORE_FOR_EACH_BLOCK_IN_WAVE = 0.5;
const SCORE_FOR_WAVE_INDEX = [0, // not used (start wave index is 1)
							  0, // 1-st wave: the same active block
							  10, // N-nd wave: all next waves
							  20, 30, 40, 50];
const SCORE_FOR_WAVE_INDEXES_NEXT = 90;
const SCORE_FOR_EACH_BLOCK_IN_BOOST_BOMB_WAVE = 0.5;
const SCORE_FOR_WAVE_INDEX_FOR_BOOST_BOMB = [0, // not used (start wave index is 1)
							  0, // 1-st wave: the same active block
							  2, // N-nd wave: all next waves
							  4, 6, 8, 10];
const SCORE_FOR_WAVE_INDEXES_NEXT_FOR_BOOST_BOMB = 20;

export const calculationScoreByWave:ScoreBonusByWaveCalculator = (wave:SectorsWave, waveIndex:WaveIndex) => {
	const result:number[] = [];

	for(let i = 0; i < wave.length; i++) {
		let score = SCORE_FOR_EACH_BLOCK_IN_WAVE * Math.max(0, waveIndex | 0);

		score += waveIndex < SCORE_FOR_WAVE_INDEX.length
				 ? SCORE_FOR_WAVE_INDEX[waveIndex]
				 : SCORE_FOR_WAVE_INDEXES_NEXT;

		result.push(score);
	}

	return result;
};

export const calculationScoreByBombBoostWave:ScoreBonusByWaveCalculator = (wave:SectorsWave, waveIndex:WaveIndex) => {
	const result:number[] = [];

	for(let i = 0; i < wave.length; i++) {
		let score = SCORE_FOR_EACH_BLOCK_IN_BOOST_BOMB_WAVE * Math.max(0, waveIndex | 0);

		score += waveIndex < SCORE_FOR_WAVE_INDEX_FOR_BOOST_BOMB.length
				 ? SCORE_FOR_WAVE_INDEX_FOR_BOOST_BOMB[waveIndex]
				 : SCORE_FOR_WAVE_INDEXES_NEXT_FOR_BOOST_BOMB;

		result.push(score);
	}

	return result;
};