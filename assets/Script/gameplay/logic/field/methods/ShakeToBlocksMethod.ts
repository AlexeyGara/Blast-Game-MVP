/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ShakeToBlocksMethod.ts
 * Path: assets/Script/gameplay/logic/field/methods/
 * Author: alexeygara
 * Last modified: 2026-02-11 09:36
 */

import type {
	BlocksDataMethod,
	BlocksFieldData,
	BlocksFieldEditor,
	SectorsWaves
} from "game_api/logic-api";

export class ShakeToBlocksMethod implements BlocksDataMethod {

	get blocksData():BlocksFieldData {
		return this._fieldProvider();
	}

	private readonly _fieldProvider:() => BlocksFieldData;
	private readonly _fieldEditor:BlocksFieldEditor;

	constructor(
		fieldProvider:() => BlocksFieldData,
		fieldEditor:BlocksFieldEditor
	) {
		this._fieldProvider = fieldProvider;
		this._fieldEditor = fieldEditor;
	}

	execute():SectorsWaves {

		const field = this._fieldProvider();

		//TODO: implement
		console.log(this._fieldEditor);
		return [field.sectors];
	}

}