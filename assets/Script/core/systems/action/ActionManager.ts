/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ActionManager.ts
 * Path: assets/Script/app/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:25
 */

import { GameLoopPhase }           from "core/gameloop/GameLoopPhase";
import type {
	IAction,
	IActionManager
}                                  from "core_api/action-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type { AppSystem }          from "core_api/system-types";

type ActiveAction = IAction & CanBeUpdate;

type ActiveCallback = {
	readonly onComplete:() => void;
	readonly onCancel:() => void;
	resolver:Promise<OnFinishResult>;
}

export class ActionManager implements IActionManager,
									  AppSystem,
									  IGameLoopUpdatable {

	readonly updatePhase = GameLoopPhase.LOGIC;

	readonly name:string;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	private readonly _active = new Set<ActiveAction>();
	private readonly _activeCallbacks = new Map<ActiveAction, ActiveCallback>();

	constructor(
		name:string
	) {
		this.name = name;
	}

	pause():void {
		this._paused = true;
	}

	resume():void {
		this._paused = false;
	}

	start(action:ActiveAction):Promise<OnFinishResult> {
		if(this._active.has(action)) {
			const actCallbacks = this._activeCallbacks.get(action)!;
			return Promise.resolve(actCallbacks.resolver);
		}

		this._active.add(action);

		const actCallbacks:Writeable<DefineRequire<ActiveCallback>> = {
			onCancel: undefined,
			onComplete: undefined,
			resolver: undefined
		};

		const result:Promise<OnFinishResult> = new Promise((resolve) => {
			actCallbacks.onCancel = ():void => resolve('cancelled');
			actCallbacks.onComplete = ():void => resolve('completed');
		});

		actCallbacks.resolver = result;

		this._activeCallbacks.set(action, actCallbacks as ActiveCallback);

		return result;
	}

	cancel(act:IAction, withComplete?:boolean):void {
		if(this._active.has(act)) {
			act.cancel(withComplete);
			this._resolveAndClear(act);
		}
	}

	cancelAll(withComplete?:boolean):void {
		for(const act of this._active) {
			this.cancel(act, withComplete);
		}
	}

	cancelAllByTag(tag:string, withComplete?:boolean):void {
		for(const act of this._active) {
			if(act.id === tag) {
				this.cancel(act, withComplete);
			}
		}
	}

	update(deltaTimeMs:number):void {
		if(this._paused) {
			return;
		}

		for(const act of this._active) {
			if(act.completed || act.canceled) {
				this._resolveAndClear(act);
			}
			else {
				act.update?.(deltaTimeMs);
				if(act.completed) {
					this._resolveAndClear(act);
				}
			}
		}
	}

	private _resolveAndClear(act:ActiveAction):void {
		if(this._active.delete(act)) {
			const actCallbacks = this._activeCallbacks.get(act)!;
			this._activeCallbacks.delete(act);
			if(act.completed) {
				actCallbacks.onComplete();
			}
			else if(act.canceled) {
				actCallbacks.onCancel();
			}
		}
	}
}
