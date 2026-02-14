/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: BoardUpdateStrategy.ts
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
 * Update game-board after blocks was collapsed, and emit specified 'complete' event.
 */
export class BoardRefillEmptySectors implements StateStrategy {

	private readonly _boardView:BoardUI;
	private readonly _fallFromMethod:BlocksDataMethod;
	private readonly _fallToEmptyMethod:BlocksDataMethod;
	private readonly _refillByNewMethod:BlocksDataMethod;

	constructor(
		boardView:BoardUI,
		fallFromMethod:BlocksDataMethod,
		fallToEmptyMethod:BlocksDataMethod,
		refillByNewMethod:BlocksDataMethod,
	) {
		this._boardView = boardView;
		this._fallFromMethod = fallFromMethod;
		this._fallToEmptyMethod = fallToEmptyMethod;
		this._refillByNewMethod = refillByNewMethod;
	}

	async perform():Promise<void> {

		await this._dropDownAndFillEmpty();
	}

	private async _dropDownAndFillEmpty():Promise<void> {

		const fallWaves:SectorsWaves = this._fallFromMethod.execute();
		const fallDownToWaves = this._fallToEmptyMethod.execute();
		await this._boardView.fallDownBlocksToEmpty(fallWaves, fallDownToWaves);

		const refillWaves:SectorsWaves = this._refillByNewMethod.execute();
		await this._boardView.refillByNewBlocks(this._refillByNewMethod.blocksData, refillWaves);
	}

}