/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ScoreInfo.ts
 * Path: assets/Script/cc/prefabs/board/
 * Author: alexeygara
 * Last modified: 2026-02-05 02:21
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
import { assertProp }                      from "../../../../global-init";
// ] <---- IMPORT ON THE TOP
import { CCSequentAnimationByStatePlayer } from "@cc_platform/animation/CCSequentAnimationByStatePlayer";
import type {
	AnimationStarter,
	IAnimationConsumer,
	IAnimationPlayer
}                                          from "core_api/animation-types";

import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

//TODO: move to singleton gameplay settings
const SCORE_INFO_VALUE_ROUND_BASE = 1;//10;

@ccclass
export class ScoreInfo extends cc.Component implements IAnimationConsumer {

	@property(cc.Node)
	appearAnimatedNode:cc.Node = assertProp(this, true, () => this.appearAnimatedNode);

	@property(cc.Label)
	label:cc.Label = cc.assertProp(this, 'label');

	private _player?:AnimationStarter;
	private _appearAnimId!:string;
	private _appearAnimWaiter?:Promise<void>;

	protected override onLoad():void {
		const ccAnim = this.appearAnimatedNode.getComponent(cc.Animation);
		this._appearAnimId = ccAnim.getClips()[0].name;
	}

	produceAnimationPlayer(manager:IAnimationPlayer):void {
		this._player = new CCSequentAnimationByStatePlayer(this.appearAnimatedNode.getComponent(cc.Animation), manager);
	}

	async show(scoreValue:number):Promise<void> {
		this.label.string = `${Math.round(scoreValue * SCORE_INFO_VALUE_ROUND_BASE) / SCORE_INFO_VALUE_ROUND_BASE}`;

		if(!this._appearAnimWaiter) {
			this._appearAnimWaiter = this._player?.start(this._appearAnimId).then(() => {
				delete this._appearAnimWaiter;
				this.onAppearAnimationComplete?.();
			});
		}

		await this._appearAnimWaiter;
	}

	onAppearAnimationComplete?:() => void;
}