/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Block.ts
 * Path: assets/Script/cc/prefabs/board/
 * Author: alexeygara
 * Last modified: 2026-02-05 04:12
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
//import { assertProp } from "@_global-init_";
// ] <---- IMPORT ON THE TOP

import { CCSequentAnimationByStatePlayer } from "@cc_platform/animation/CCSequentAnimationByStatePlayer";
import type {
	AnimationStarter,
	IAnimationConsumer,
	IAnimationPlayer
}                                          from "core_api/animation-types";
import ccclass = cc._decorator.ccclass;

@ccclass
export class Block extends cc.Component implements IAnimationConsumer {

	private _player?:AnimationStarter;
	private _appearAnimId!:string;
	private _disappearAnimId!:string;
	private _fallenDownAnimId!:string;
	private _shakeAnimId!:string;
	private _animationsPlaying:Set<string> = new Set();

	protected override onLoad():void {
		const ccAnim = this.getComponent(cc.Animation);
		let animIndex = 0;
		this._appearAnimId = ccAnim.getClips()[animIndex++].name;
		this._disappearAnimId = ccAnim.getClips()[animIndex++].name;
		this._fallenDownAnimId = ccAnim.getClips()[animIndex++].name;
		this._shakeAnimId = ccAnim.getClips()[animIndex++].name;
	}

	produceAnimationPlayer(manager:IAnimationPlayer):void {
		this._player = new CCSequentAnimationByStatePlayer(this.getComponent(cc.Animation), manager);
	}

	async startAppearAnim():Promise<void> {
		await this._playAnimation(this._appearAnimId, this.onAppearAnimationComplete);
	}

	async startDisappearAnim():Promise<void> {
		await this._playAnimation(this._disappearAnimId, this.onDisappearAnimationComplete);
	}

	async startFallenDowAnim():Promise<void> {
		await this._playAnimation(this._fallenDownAnimId, this.onFallenDownAnimationComplete);
	}

	playShakeAnim():void {
		if(this._animationsPlaying.size) {
			return;
		}

		void this._playAnimation(this._shakeAnimId);
	}

	onAppearAnimationComplete?:() => void;

	onDisappearAnimationComplete?:() => void;

	onFallenDownAnimationComplete?:() => void;

	private async _playAnimation(animationId:string, callback?:() => void):Promise<void> {
		if(this._animationsPlaying.has(animationId)) {
			return;
		}

		this._animationsPlaying.add(animationId);

		await this._player?.start(animationId).then(() => {
			this._animationsPlaying.delete(animationId);
			callback?.();
		}).catch(() => {
			this._animationsPlaying.delete(animationId);
		});
	}
}