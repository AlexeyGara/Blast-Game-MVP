/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: DelayAsyncAction.ts
 * Path: assets/Script/app/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:32
 */

import { Action } from "core/systems/action/Action";

export class DelayOutLoopAction extends Action {

	get progress():number {
		if(!this.delayMs) {
			return 1;
		}
		if(!this._startTimeStamp) {
			return 0;
		}
		return Math.max(0, Math.min(1, (Date.now() - this._startTimeStamp) / this.delayMs));
	}

	get elapsedTime():number {
		if(!this._startTimeStamp) {
			return 0;
		}
		return Math.min(this.delayMs, Date.now() - this._startTimeStamp);
	}

	readonly delayMs:number;
	private _timer?:ReturnType<typeof setTimeout>;
	private _startTimeStamp:number = 0;

	constructor(
		delayMs:number,
		id:string = ""
	) {
		super(
			id
		);
		this.delayMs = delayMs;
	}

	protected override doCancel():void {
		this._stopTimer();
	}

	private _launchTimer(delayMs:number):void {
		this._startTimeStamp = Date.now();
		this._timer = setTimeout(this._onTimeout, delayMs);
	}

	private _stopTimer():void {
		if(this._timer) {
			clearTimeout(this._timer);
		}
		delete this._timer;
	}

	private _onTimeout = ():void => {
		this._stopTimer();
		if(!this.completed && !this.canceled) {
			(this.completed as Writeable<boolean>) = true;
		}
	};

	protected override doUpdate(deltaTimeMs:number):void {
		if(!this._timer) {
			this._launchTimer(Math.max(this.delayMs - deltaTimeMs));
		}
	}

	protected checkIsCompleteAfterUpdate():boolean {
		return this.completed;
	}
}