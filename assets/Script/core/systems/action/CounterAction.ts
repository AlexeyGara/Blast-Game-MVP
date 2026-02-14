/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CounterAction.ts
 * Path: assets/Script/app/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:28
 */

import { Action }    from "core/systems/action/Action";
import { LineInOut } from "core/systems/action/ease/easings";

export class CounterAction extends Action {

	get progress():number {
		if(this._durationSec <= 0) {
			return 1;
		}

		return Math.min(1, this._elapsedTimeSec / this._durationSec);
	}

	get value():number {
		return this._currValue;
	}

	private readonly _startValue:number;
	private readonly _endValue:number;
	private readonly _durationSec:number;
	private _currValue:number;
	private _elapsedTimeSec:number = 0;
	private readonly _process:(from:number, to:number, progress:number) => number;

	constructor(
		startValue:number,
		endValue:number,
		durationSec:number,
		easing?:(from:number, to:number, progress:number) => number
	) {
		super();
		this._currValue = startValue;
		this._startValue = startValue;
		this._endValue = endValue;
		this._durationSec = durationSec;
		this._process = easing ? easing : LineInOut;
	}

	protected override doUpdate(deltaTimeMs:number):void {
		this._elapsedTimeSec += deltaTimeMs / 1000;
		this._currValue = this._process(this._startValue, this._endValue, this.progress);
	}

	protected checkIsCompleteAfterUpdate():boolean {
		return this._durationSec <= 0 ||
			   this._endValue - this._currValue <= 0;
	}

}