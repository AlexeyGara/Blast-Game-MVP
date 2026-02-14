/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: AnimationManager.ts
 * Path: assets/Script/app/core/animation/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:05
 */

import { GameLoopPhase } from "core/gameloop/GameLoopPhase";
import type {
	IAnimation,
	IAnimationManager
}                        from "core_api/animation-types";

import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type { AppSystem }          from "core_api/system-types";

type ActiveAnimation = IAnimation & CanBeUpdate;

type ActiveCallback = {
	readonly onFinish:() => void;
	readonly onCancel:() => void;
	resolver:Promise<OnFinishResult>;
}

export class AnimationManager implements IAnimationManager,
										 AppSystem,
										 IGameLoopUpdatable {

	readonly updatePhase = GameLoopPhase.ANIMATION;

	readonly name:string;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	private readonly _active = new Set<ActiveAnimation>();
	private readonly _activeCallbacks = new Map<ActiveAnimation, ActiveCallback>();

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

	play(animation:ActiveAnimation):Promise<OnFinishResult> {
		if(this._active.has(animation)) {
			const animCallbacks = this._activeCallbacks.get(animation)!;
			return Promise.resolve(animCallbacks.resolver);
		}

		this._active.add(animation);

		const animCallbacks:Writeable<DefineRequire<ActiveCallback>> = {
			onCancel: undefined,
			onFinish: undefined,
			resolver: undefined
		};

		const result:Promise<OnFinishResult> = new Promise((resolve) => {
			animCallbacks.onCancel = ():void => resolve('cancelled');
			animCallbacks.onFinish = ():void => resolve('completed');
		});

		this._activeCallbacks.set(animation, animCallbacks as ActiveCallback);

		return result;
	}

	cancel(animation:ActiveAnimation, withComplete?:boolean):void {
		if(this._active.has(animation)) {
			animation.cancel(withComplete);
			this._resolveAndClear(animation);
		}
	}

	cancelAll(withComplete?:boolean):void {
		for(const anim of this._active) {
			this.cancel(anim, withComplete);
		}
	}

	cancelAllByTag(tag:string, withComplete?:boolean):void {
		for(const anim of this._active) {
			if(anim.tag === tag) {
				this.cancel(anim, withComplete);
			}
		}
	}

	update(deltaTimeMs:number):void {
		if(this._paused) {
			return;
		}

		for(const anim of this._active) {
			if(anim.finished || anim.canceled) {
				this._resolveAndClear(anim);
			}
			else if(!anim.paused) {
				anim.update?.(deltaTimeMs);
				if(anim.finished) {
					this._resolveAndClear(anim);
				}
			}
		}
	}

	private _resolveAndClear(anim:ActiveAnimation):void {
		if(this._active.delete(anim)) {
			const animCallbacks = this._activeCallbacks.get(anim)!;
			this._activeCallbacks.delete(anim);
			if(anim.finished) {
				animCallbacks.onFinish();
			}
			else if(anim.canceled) {
				animCallbacks.onCancel();
			}
		}
	}

}