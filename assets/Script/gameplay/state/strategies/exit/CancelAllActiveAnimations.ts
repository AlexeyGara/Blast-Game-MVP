/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: CancelAllActiveAnimations.ts
 * Path: assets/Script/gameplay/state/strategies/exit/
 * Author: alexeygara
 * Last modified: 2026-02-12 04:54
 */

import type { IAnimationManager } from "core_api/animation-types";
import type { StateStrategy }     from "game_api/states-api";

export class CancelAllActiveAnimations implements StateStrategy {

	private readonly _withComplete?:boolean;
	private readonly _animationManager:IAnimationManager;
	private readonly _releaseAnimationManager?:(manager:IAnimationManager) => void;

	constructor(
		animationManager:IAnimationManager,
		cancelWithComplete?:boolean,
		releaseAnimationManager?:(manager:IAnimationManager) => void
	) {
		this._animationManager = animationManager;
		this._withComplete = cancelWithComplete;
		this._releaseAnimationManager = releaseAnimationManager;
	}

	perform():Promise<void> {

		this._animationManager.cancelAll(this._withComplete);

		this._releaseAnimationManager?.(this._animationManager);

		return Promise.resolve();
	}

}