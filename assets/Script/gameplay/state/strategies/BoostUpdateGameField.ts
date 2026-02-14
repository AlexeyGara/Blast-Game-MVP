/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerBoostStrategy.ts
 * Path: assets/Script/gameplay/states/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-04 03:44
 */

import { GameplayBoostID }    from "game/boosts/BoostID";
import type { BoardUI }       from "game/ui/board/BoardUI";
import type {
	BlocksDataMethod,
	PlayerTurnResult,
	SectorsWaves
}                             from "game_api/logic-api";
import type { StateStrategy } from "game_api/states-api";

//TODO: move to singleton gameplay settings
const DELAY_BEFORE_SHOW_SCORES_MAP_BY_EACH_COLLAPSED_BLOCK_MS = 250;

/**
 * Apply selected boost, and emit specified 'complete' event.
 */
export class BoostUpdateGameField implements StateStrategy {

	private readonly _boostId:GameplayBoostID;
	private readonly _playerTurnResultProvider:() => Pick<PlayerTurnResult, 'scoreBySectors'>;
	private readonly _boardView:BoardUI;
	private readonly _updateBlocksMethod:BlocksDataMethod;

	constructor(
		boostId:GameplayBoostID,
		boardView:BoardUI,
		playerTurnResultProvider:() => Pick<PlayerTurnResult, 'scoreBySectors'>,
		updateBlocksMethod:BlocksDataMethod
	) {
		this._playerTurnResultProvider = playerTurnResultProvider;
		this._boostId = boostId;
		this._boardView = boardView;
		this._updateBlocksMethod = updateBlocksMethod;
	}

	async perform():Promise<void> {
		if(!this._boostId) {
			return Promise.resolve(void 0);
		}

		await this._updateBlocksByBoost();
	}

	private async _updateBlocksByBoost():Promise<void> {

		const updateWaves:SectorsWaves = this._updateBlocksMethod.execute();

		const waiters:Promise<void>[] = [];

		switch(this._boostId) {
			case GameplayBoostID.TELEPORT:
				waiters.push(this._boardView.teleportBlocks(updateWaves));
				break;

			case GameplayBoostID.BOMB:
				waiters.push(this._boardView.collapseBlocks(this._updateBlocksMethod.blocksData, updateWaves));

				//TODO: use actions managers instead
				await wait(DELAY_BEFORE_SHOW_SCORES_MAP_BY_EACH_COLLAPSED_BLOCK_MS);

				const turnResult = this._playerTurnResultProvider();
				waiters.push(this._boardView.showScores(...turnResult.scoreBySectors));
				break;

			default:
				assertNever(this._boostId);
		}

		await Promise.all(waiters);
	}
}