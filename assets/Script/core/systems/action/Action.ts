/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Action.ts
 * Path: assets/Script/app/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:19
 */

import type { IAction } from "core_api/action-types";

type FinishResolver = {
	readonly onComplete:() => void;
	readonly onCancel:() => void;
}

export abstract class Action implements IAction,
										CanBeUpdate,
										FinishAwait {

	abstract get progress():number;

	readonly canceled:boolean = false;
	readonly completed:boolean = false;
	readonly id:string;
	private _finishResolver:FinishResolver | undefined;

	protected constructor(
		tag:string = ""
	) {
		this.id = tag;
	}

	cancel(withComplete?:boolean):void {
		if(!this.canceled) {
			(this.completed as Writeable<boolean>) = withComplete || this.completed;
			(this.canceled as Writeable<boolean>) = true;

			this.doCancel?.();
		}

		this._tryResolveFinished();
	}

	protected doCancel?():void;

	update(deltaTimeMs:number):void {
		if(!this.completed && !this.canceled) {
			this.doUpdate?.(deltaTimeMs);

			if(this.checkIsCompleteAfterUpdate()) {
				(this.completed as Writeable<boolean>) = true;

				this._tryResolveFinished();
			}
		}
	}

	protected doUpdate?(deltaTimeMs:number):void;

	protected abstract checkIsCompleteAfterUpdate():boolean;

	waitFinish():Promise<OnFinishResult> {
		delete this._finishResolver;

		if(this.completed) {
			return Promise.resolve("completed");
		}

		if(this.canceled) {
			return Promise.resolve('cancelled');
		}

		const actCallbacks = {
			onCancel: ():void => {
			},
			onComplete: ():void => {
			}
		};

		const result:Promise<OnFinishResult> = new Promise((resolve) => {
			actCallbacks.onCancel = ():void => resolve('cancelled');
			actCallbacks.onComplete = ():void => resolve('completed');
		});

		this._finishResolver = actCallbacks;
		return result;
	}

	private _tryResolveFinished():void {
		if(this._finishResolver) {
			if(this.completed) {
				this._finishResolver.onComplete();
				delete this._finishResolver;
			}
			else if(this.canceled) {
				this._finishResolver.onCancel();
				delete this._finishResolver;
			}
		}
	}

}