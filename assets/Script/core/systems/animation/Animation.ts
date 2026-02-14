/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Chesstles-TS
 * File: Action.ts
 * Author: alexeygara
 * Last modified: 2026-01-10 19:11
 */

import type { IAnimation } from "core_api/animation-types";

export abstract class Animation implements IAnimation,
										   CanBeUpdate {

	abstract get progress():number;

	readonly finished:boolean = false;
	readonly canceled:boolean = false;
	readonly paused:boolean = false;
	readonly tag:string;

	protected constructor(
		tag:string = ""
	) {
		this.tag = tag;
	}

	pause():void {
		if(!this.paused && !this.finished && !this.canceled) {
			(this.paused as Writeable<boolean>) = true;

			this.doPause?.();
		}
	}

	protected doPause?():void;

	resume():void {
		if(this.paused && !this.finished && !this.canceled) {
			(this.paused as Writeable<boolean>) = false;

			this.doResume?.();
		}
	}

	protected doResume?():void;

	cancel(withComplete?:boolean):void {
		if(!this.canceled) {
			(this.finished as Writeable<boolean>) = withComplete || this.finished;
			(this.canceled as Writeable<boolean>) = true;

			this.doCancel?.();
		}
	}

	protected doCancel?():void;

	update(deltaTimeMs:number):void {
		if(!this.finished && !this.canceled) {
			this.doUpdate?.(deltaTimeMs);
			(this.finished as Writeable<boolean>) = this.checkFinished();
		}
	}

	protected doUpdate?(deltaTimeMs:number):void;

	protected abstract checkFinished():boolean;

}