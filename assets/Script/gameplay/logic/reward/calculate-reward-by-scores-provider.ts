/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: calculate-reward-by-scores.ts
 * Path: assets/Script/gameplay/logic/reward/
 * Author: alexeygara
 * Last modified: 2026-02-07 04:32
 */

import { GameplayBoostID }              from "game/boosts/BoostID";
import type { RewardByScoreCalculator } from "game_api/game-api";
import type { LevelSettingsDTO }        from "game_api/level-settings";
import type {
	GameBoosters,
	SectorsWaves
}                                       from "game_api/logic-api";

type CalculateRewardByScoresProvider = (settings:Pick<LevelSettingsDTO, 'reward'>) => RewardByScoreCalculator;

export const calculateRewardByScoresProvider:CalculateRewardByScoresProvider = (settings) => {

	return (score:number, waves:SectorsWaves) => {

		const result = {
			teleport: 0,
			bomb: 0
		};

		const boosters = Object.values(GameplayBoostID);

		for(const boost of boosters) {
			switch(boost) {
				case GameplayBoostID.TELEPORT:
					const teleportChance = (score / settings.reward.TELEPORT_BOOST_FOR_EACH_SCORE_MORE_THAN) +
										   // each special block is a single wave, so player can get more than 10 waves even the game-field is 9x9 sectors.
										   (waves.length * settings.reward.TELEPORT_BOOST_EACH_WAVE_CAPACITY);
					result.teleport += teleportChance | 0;
					break;

				case GameplayBoostID.BOMB:
					const bombChance = (score / settings.reward.BOMB_BOOST_FOR_EACH_SCORE_MORE_THAN) +
									   // each special block is a single wave, so player can get more than 20 waves even the game-field is 9x9 sectors.
									   (waves.length * settings.reward.BOMB_BOOST_EACH_WAVE_CAPACITY);
					result.bomb += bombChance | 0;
					break;

				default:
					assertNever(boost);
			}
		}

		return result as GameBoosters;
	};
};

export const calculateRewardByBombBoostProvider:CalculateRewardByScoresProvider = (settings) => {

	return (score:number, waves:SectorsWaves) => {

		const result = {
			teleport: 0,
			bomb: 0
		};

		const boosters = Object.values(GameplayBoostID);

		for(const boost of boosters) {
			switch(boost) {
				case GameplayBoostID.TELEPORT:
					const teleportChance = (score /
											settings.reward.usingBombBooster.TELEPORT_BOOST_FOR_EACH_SCORE_MORE_THAN /
											10) +
										   (waves.length *
											settings.reward.usingBombBooster.TELEPORT_BOOST_EACH_WAVE_CAPACITY / 10);
					result.teleport += teleportChance | 0;
					break;

				case GameplayBoostID.BOMB:
					const bombChance = (score / settings.reward.usingBombBooster.BOMB_BOOST_FOR_EACH_SCORE_MORE_THAN /
										10) +
									   (waves.length * settings.reward.usingBombBooster.BOMB_BOOST_EACH_WAVE_CAPACITY /
										10);
					result.bomb += bombChance | 0;
					break;

				default:
					assertNever(boost);
			}
		}

		return result as GameBoosters;
	};
};