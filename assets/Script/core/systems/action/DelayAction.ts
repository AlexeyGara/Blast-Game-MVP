/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: DelayAction.ts
 * Path: assets/Script/app/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:31
 */

import { Action } from "core/systems/action/Action";

export class DelayAction extends Action {

	get progress():number {
		if(!this.delayMs) {
			return 1;
		}
		return Math.max(0, Math.min(1, this._elapsedMs / this.delayMs));
	}

	get elapsedTime():number {
		return Math.min(this.delayMs, this._elapsedMs);
	}

	readonly delayMs:number;
	private _elapsedMs:number = 0;

	constructor(
		delayMs:number,
		id:string = ""
	) {
		super(
			id
		);
		this.delayMs = delayMs;
	}

	protected override doUpdate(deltaTimeMs:number):void {
		this._elapsedMs += deltaTimeMs;
	}

	protected checkIsCompleteAfterUpdate():boolean {
		return this._elapsedMs >= this.delayMs;
	}
}