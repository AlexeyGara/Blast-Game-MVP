/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoardPrepareToGame.ts
 * Path: assets/Script/gameplay/state/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-10 06:52
 */

import type { BoardUI } from "game/ui/board/BoardUI";
import type {
	BlocksDataMethod,
	SectorsWaves
}                       from "game_api/logic-api";
import type { StateStrategy } from "game_api/states-api";

/**
 * Fill the empty game-board at start, and emit specified 'complete' event.
 */
export class BoardPrepareToGame implements StateStrategy {

	private readonly _boardView:BoardUI;
	private readonly _clearAndFillMethod:BlocksDataMethod;

	constructor(
		boardView:BoardUI,
		initialFillMethod:BlocksDataMethod
	) {
		this._boardView = boardView;
		this._clearAndFillMethod = initialFillMethod;
	}

	async perform():Promise<void> {

		await this._clearAndFillBoard();
	}

	private async _clearAndFillBoard():Promise<void> {

		const fillWaves:SectorsWaves = this._clearAndFillMethod.execute();

		await this._boardView.fillWithInitialBlocks(this._clearAndFillMethod.blocksData, fillWaves);
	}

}