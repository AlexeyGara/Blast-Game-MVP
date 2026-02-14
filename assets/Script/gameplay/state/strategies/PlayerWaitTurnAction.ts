/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PlayerTurnStrategy.ts
 * Path: assets/Script/gameplay/states/strategies/
 * Author: alexeygara
 * Last modified: 2026-02-04 03:36
 */

import { DelayAction }           from "core/systems/action/DelayAction";
import type { IActionManager }   from "core_api/action-types";
import type { BoardUI }          from "game/ui/board/BoardUI";
import type { LevelSettingsDTO } from "game_api/level-settings";
import type { BlocksDataMethod } from "game_api/logic-api";
import type { StateStrategy }    from "game_api/states-api";

/**
 * Prepare for player turn, and wait player interaction.
 */
export class PlayerWaitTurnAction implements StateStrategy {

	private readonly _boardView:BoardUI;
	private readonly _actionManager:IActionManager;
	private readonly _settings:Pick<LevelSettingsDTO, 'behaviour'>;
	private readonly _getBlockForIdleShakeMethod:BlocksDataMethod;

	constructor(
		boardView:BoardUI,
		settings:Pick<LevelSettingsDTO, 'behaviour'>,
		actionManager:IActionManager,
		getBlockForIdleShakeMethod:BlocksDataMethod
	) {
		this._settings = settings;
		this._actionManager = actionManager;
		this._boardView = boardView;
		this._getBlockForIdleShakeMethod = getBlockForIdleShakeMethod;
	}

	perform():Promise<void> {

		this._requestBlocksIdleShake();

		return new Promise(() => {
			//never resolved
		});
	}

	private _requestBlocksIdleShake():void {

		const delayMs = this._settings.behaviour.DELAY_BEFORE_IDLE_SHAKE_MIN_MS + Math.round(
			(this._settings.behaviour.DELAY_BEFORE_IDLE_SHAKE_MAX_MS -
			 this._settings.behaviour.DELAY_BEFORE_IDLE_SHAKE_MIN_MS)
			* Math.random());

		void this._actionManager.start(
			new DelayAction(delayMs, 'Delay before shake blocks')
		).then(() => {
			this._doBlocksIdleShake();
			this._requestBlocksIdleShake();
		});
	}

	private _doBlocksIdleShake = ():void => {

		const waves = this._getBlockForIdleShakeMethod.execute();

		void this._boardView.idleShakeBoardBlocks(waves);
	};
}