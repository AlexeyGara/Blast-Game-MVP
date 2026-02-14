/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CCSequentAnimationPlayer.ts
 * Path: assets/Script/platform/cc/platform/animation/
 * Author: alexeygara
 * Last modified: 2026-02-12 04:54
 */

import { CCAnimationByState } from "@cc_platform/animation/CCAnimationByState";
import type {
	AnimationStarter,
	IAnimationPlayer
}                             from "core_api/animation-types";
import type { IDestroyable } from "core_api/base-types";
import type { CanBePaused }  from "core_api/system-types";

type AnimationResolver = {
	readonly animationId:string;
	readonly doResolve:() => void;
	readonly waiter:Promise<void>;
	next?:AnimationResolver;
}

type CCAnimStateProvider = Pick<cc.Animation, 'hasAnimationState' | 'sample' | 'getAnimationState'>;

export class CCSequentAnimationByStatePlayer implements AnimationStarter,
														CanBePaused,
														IDestroyable {

	readonly destroyed:boolean = false;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	private _ccAnimation:CCAnimStateProvider;
	private _animationResolver?:AnimationResolver;
	private _activeAnimation?:CCAnimationByState;
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

		this._activeAnimation?.pause();
	}

	resume():void {
		if(this.destroyed || !this._paused) {
			return;
		}

		this._paused = false;

		this._activeAnimation?.resume();
	}

	start(animationId:string):Promise<void> {
		if(this.destroyed) {
			return Promise.resolve();
		}

		const resolver = this._getFinalAnimationResolver(animationId, this._animationResolver);
		if(resolver) {
			if(resolver.animationId == animationId) {
				return resolver.waiter;
			}

			let doResolve!:() => void;
			const waiter = new Promise<void>((resolve) => {
				doResolve = resolve;
			});

			resolver.next = { animationId, doResolve, waiter };

			return resolver.next!.waiter;
		}

		if(!this._ccAnimation.hasAnimationState(animationId)) {
			return Promise.reject(`Has no animation named '${animationId}'.`);
		}

		return this._doStart(animationId);
	}

	private _doStart(animationId:string):Promise<void>;
	private _doStart(animationResolver:AnimationResolver):void;
	private _doStart(animationIdOrResolver:string | AnimationResolver):Promise<void> | void {

		if(typeof animationIdOrResolver === 'string') {
			let doResolve!:() => void;
			const waiter:Promise<void> = new Promise<void>((resolve) => {
				doResolve = resolve;
			});
			this._animationResolver = { animationId: animationIdOrResolver, doResolve, waiter };
		}
		else {
			this._animationResolver = animationIdOrResolver;
		}

		const animationId = this._animationResolver.animationId;

		const ccAnimState = this._ccAnimation.getAnimationState(animationId);

		ccAnimState.time = 0;

		this._activeAnimation = new CCAnimationByState(ccAnimState,
													   () => this._ccAnimation.sample(animationId));

		if(this._paused) {
			this._activeAnimation.pause();
		}

		void this._animationManager.play(this._activeAnimation).then(this._onFinished);

		if(typeof animationIdOrResolver === 'string') {
			return this._animationResolver.waiter;
		}
	}

	private _onFinished = (result:OnFinishResult):void => {

		delete this._activeAnimation;

		if(!this._animationResolver) {
			return;
		}

		if(result == 'completed') {
			this._animationResolver?.doResolve();
		}

		this._animationResolver = this._animationResolver.next;

		if(this._animationResolver) {
			this._doStart(this._animationResolver);
		}
	};

	cancel():void {
		if(this.destroyed) {
			return;
		}

		this._activeAnimation?.cancel();
		delete this._animationResolver;
		delete this._activeAnimation;
	}

	destroy():void {
		this.cancel();

		(this.destroyed as Writeable<boolean>) = true;
	}

	private _getFinalAnimationResolver(animationId:string, resolver?:AnimationResolver):AnimationResolver | undefined {
		if(resolver?.animationId == animationId) {
			return resolver;
		}

		if(resolver?.next) {
			return this._getFinalAnimationResolver(animationId, resolver.next);
		}

		return resolver;
	}

}