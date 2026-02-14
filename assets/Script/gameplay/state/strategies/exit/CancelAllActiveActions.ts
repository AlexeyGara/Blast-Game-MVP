/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: CancelAllActiveActions.ts
 * Path: assets/Script/gameplay/state/strategies/exit/
 * Author: alexeygara
 * Last modified: 2026-02-14 18:45
 */

import type { IActionManager } from "core_api/action-types";
import type { StateStrategy }  from "game_api/states-api";

export class CancelAllActiveActions implements StateStrategy {

	private readonly _withComplete?:boolean;
	private readonly _actionManager:IActionManager;
	private readonly _releaseActionManager?:(actionManager:IActionManager) => void;

	constructor(
		actionManager:IActionManager,
		cancelWithComplete?:boolean,
		releaseActionManager?:(actionManager:IActionManager) => void
	) {
		this._actionManager = actionManager;
		this._withComplete = cancelWithComplete;
		this._releaseActionManager = releaseActionManager;
	}

	perform():Promise<void> {

		this._actionManager.cancelAll(this._withComplete);

		this._releaseActionManager?.(this._actionManager);

		return Promise.resolve();
	}

}