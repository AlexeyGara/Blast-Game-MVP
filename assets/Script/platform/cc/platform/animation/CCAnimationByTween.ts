/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: CCAnimationByTween.ts
 * Path: assets/Script/platform/cc/platform/animation/
 * Author: alexeygara
 * Last modified: 2026-02-15 19:19
 */

import { Animation } from "core/systems/animation/Animation";

type HackedAction = cc.Action & {
	step(deltaTimeSec:number):void;
	getDuration():number;
	getElapsed():number;
};

type HackedTween = cc.Tween & { _finalAction?:HackedAction };

export class CCAnimationByTween extends Animation {

	get progress():number {
		if(!this._action) {
			return 0;
		}
		return Math.max(0, Math.min(1, this._action.getElapsed() / (this._action.getDuration() || 1)));
	}

	private readonly _action:HackedAction;

	constructor(
		tween:cc.Tween
	) {
		super();
		const hackedTween = tween as HackedTween;
		if(!hackedTween._finalAction) {
			hackedTween.start();
		}
		this._action = hackedTween._finalAction as HackedAction;
		cc.director.getActionManager().removeAction(this._action);
	}

	protected override doUpdate(deltaTimeMs:number):void {
		if(this._action.getElapsed() < this._action.getDuration()) {
			this._action.step(deltaTimeMs / 1000);
		}
	}

	protected checkFinished():boolean {
		return this._action.getElapsed() >= this._action.getDuration();
	}

	protected override doCancel():void {
		if(this.finished) {
			this._action.step(Math.max(0, this._action.getDuration() - this._action.getElapsed()));
		}
	}

}