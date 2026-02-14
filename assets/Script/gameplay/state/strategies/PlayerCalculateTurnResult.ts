/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: PlayerResultTransition.ts
 * Path: assets/Script/gameplay/states/transitions/
 * Author: alexeygara
 * Last modified: 2026-02-01 17:04
 */

import type { BoardUI } from "game/ui/board/BoardUI";
import type {
	BlocksDataMethod,
	PlayerTurnResult,
	SectorsWaves
}                       from "game_api/logic-api";
import type { StateStrategy } from "game_api/states-api";

//TODO: move to singleton gameplay settings
const DELAY_BEFORE_SHOW_SCORES_MAP_BY_EACH_COLLAPSED_BLOCK_MS = 250;

/**
 * Calculate result of player's turn, and emit specified 'complete' event.
 */
export class PlayerCalculateTurnResult implements StateStrategy {

	private readonly _boardView:BoardUI;
	private readonly _playerTurnResultProvider:() => Pick<PlayerTurnResult, 'scoreBySectors'>;
	private readonly _applyMethod:BlocksDataMethod;

	constructor(
		boardView:BoardUI,
		playerTurnResultProvider:() => Pick<PlayerTurnResult, 'scoreBySectors'>,
		applyMethod:BlocksDataMethod
	) {
		this._boardView = boardView;
		this._playerTurnResultProvider = playerTurnResultProvider;

		this._applyMethod = applyMethod;
	}

	async perform():Promise<void> {

		await this._collapseBlocks();
	}

	private async _collapseBlocks():Promise<void> {
		const collapseWaves:SectorsWaves = this._applyMethod.execute();

		const waiters:Promise<void>[] = [];

		waiters.push(this._boardView.collapseBlocks(this._applyMethod.blocksData, collapseWaves));

		//TODO: use actions managers instead
		await wait(DELAY_BEFORE_SHOW_SCORES_MAP_BY_EACH_COLLAPSED_BLOCK_MS);

		const turnResult = this._playerTurnResultProvider();
		waiters.push(this._boardView.showScores(...turnResult.scoreBySectors));

		await Promise.all(waiters);
	}

}