/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: CCAnimation.ts
 * Path: assets/Script/platform/cc/platform/animation/
 * Author: alexeygara
 * Last modified: 2026-02-15 14:59
 */

import { Animation } from "core/systems/animation/Animation";

export class CCAnimationByState extends Animation {

	get progress():number {
		return Math.max(0, Math.min(1, this._state.time / (this._state.duration || 1)));
	}

	private readonly _state:cc.AnimationState;
	private readonly _stepToCurrentFrameTime:() => void;

	constructor(
		state:cc.AnimationState,
		stepToCurrentFrameTime:() => void,
	) {
		super();
		this._state = state;
		this._stepToCurrentFrameTime = stepToCurrentFrameTime;
	}

	protected override doUpdate(deltaTimeMs:number):void {
		if(this._state.time < this._state.duration) {
			this._state.time = Math.min(this._state.time + (deltaTimeMs / 1000), this._state.duration);
			this._stepToCurrentFrameTime();
		}
	}

	protected checkFinished():boolean {
		return this._state.time >= this._state.duration;
	}

	protected override doCancel():void {
		if(this.finished) {
			this._state.time = this._state.duration;
			this._stepToCurrentFrameTime();
		}
	}

}