/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CCParallelAnimationPlayer.ts
 * Path: assets/Script/platform/cc/platform/animation/
 * Author: alexeygara
 * Last modified: 2026-02-12 04:54
 */

import { CCAnimationByState } from "@cc_platform/animation/CCAnimationByState";
import type {
	AnimationStarter,
	IAnimationPlayer
}                             from "core_api/animation-types";
import type { IDestroyable }  from "core_api/base-types";
import type { CanBePaused }   from "core_api/system-types";

type CCAnimStateProvider = Pick<cc.Animation, 'hasAnimationState' | 'sample' | 'getAnimationState'>;

export class CCParallelAnimationByStatePlayer implements AnimationStarter,
														 CanBePaused,
														 IDestroyable {

	readonly destroyed:boolean = false;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	private _ccAnimation:CCAnimStateProvider;
	private _animationWaiters:Map<string, Promise<void>> = new Map();
	private _activeAnimations:Map<string, CCAnimationByState> = new Map();
	private _animationManager:IAnimationPlayer;

	constructor(
		ccAnimation:cc.Animation,
		animationManager:IAnimationPlayer
	) {
		this._ccAnimation = ccAnimation;
		this._animationManager = animationManager;
	}

	pause():void {
		if(this.destroyed || this._paused) {
			return;
		}

		this._paused = true;

		for(const ccAnim of this._activeAnimations.values()) {
			ccAnim.pause();
		}
	}

	resume():void {
		if(this.destroyed || !this._paused) {
			return;
		}

		this._paused = false;

		for(const ccAnim of this._activeAnimations.values()) {
			ccAnim.resume();
		}
	}

	start(animationId:string):Promise<void> {
		if(this.destroyed) {
			return Promise.resolve();
		}

		const animWaiter = this._animationWaiters.get(animationId);
		if(animWaiter) {
			return animWaiter;
		}

		if(!this._ccAnimation.hasAnimationState(animationId)) {
			return Promise.reject(`Has no animation named '${animationId}'.`);
		}

		let doResolve!:() => void;
		const waiter = new Promise<void>((resolve) => {
			doResolve = resolve;
		});

		const ccAnimState = this._ccAnimation.getAnimationState(animationId);

		ccAnimState.time = 0;

		const ccAnim = new CCAnimationByState(ccAnimState,
											  () => this._ccAnimation.sample(animationId));
		if(this._paused) {
			ccAnim.pause();
		}

		void this._animationManager.play(ccAnim).then((result:OnFinishResult) => {
			if(result == 'completed') {
				this._animationWaiters.delete(animationId);
				this._activeAnimations.delete(animationId);
				doResolve();
			}
		});

		this._animationWaiters.set(animationId, waiter);
		this._activeAnimations.set(animationId, ccAnim);

		return waiter;
	}

	cancel():void {
		if(this.destroyed) {
			return;
		}

		this._animationWaiters.clear();
		const ccAnimations = this._activeAnimations.values();
		this._activeAnimations.clear();
		for(const ccAnim of ccAnimations) {
			this._animationManager.cancel(ccAnim);
		}
	}

	destroy():void {
		this.cancel();

		(this.destroyed as Writeable<boolean>) = true;
	}

}