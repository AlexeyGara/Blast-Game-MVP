/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: FulfillMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-04 00:44
 */

import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	SectorsWaves
} from "game_api/logic-api";

/**
 * Fill the empty game-board with initial blocks for start the game.
 */
export class FillFullBoardMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;
	private readonly _refillMethod:BlocksDataMethod;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor,
		refillMethod:BlocksDataMethod
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
		this._refillMethod = refillMethod;
	}

	execute():SectorsWaves {

		this._fieldEditor.clear();

		return this._refillMethod.execute();
	}

}