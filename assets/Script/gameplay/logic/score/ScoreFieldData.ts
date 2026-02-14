/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ScoreFieldData.ts
 * Path: assets/Script/gameplay/logic/score/
 * Author: alexeygara
 * Last modified: 2026-02-03 23:02
 */

import type {
	BoardSize,
	ScoreInfo,
	ScoresFieldData,
	ScoresFieldEditor
}                    from "game/api/logic-api";
import { FieldData } from "game/logic/field/FieldData";

export class ScoreFieldData extends FieldData<ScoreInfo, 0> implements ScoresFieldData,
																	   ScoresFieldEditor {

	constructor(
		boardSize:BoardSize
	) {
		super(boardSize.rowsCount,
			  boardSize.columnsCount,
			  0);
	}
}