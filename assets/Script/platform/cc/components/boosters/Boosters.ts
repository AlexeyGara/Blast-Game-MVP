/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Boosters.ts
 * Path: assets/Script/cc/components/boosters/
 * Author: alexeygara
 * Last modified: 2026-02-04 02:40
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
import { GameplayBoostID }                 from "game/boosts/BoostID";
import type {
	BoostersInteractiveUI,
	IBoostsViewImpl
}                                          from "game_api/game-api";
import type { GameBoosters }               from "game_api/logic-api";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class Boosters extends cc.Component implements IBoostsViewImpl,
															   BoostersInteractiveUI,
															   IAnimationConsumer {

	@property({
				  type: cc.Button,
				  tooltip: 'Booster "teleport" button.'
			  })
	boosterTeleport:cc.Button = assertProp(this, 'boosterTeleport');

	@property({
				  type: cc.Label,
				  tooltip: 'Booster "teleport" count label.'
			  })
	boosterTeleportCount:cc.Label = cc.assertProp(this, 'boosterTeleportCount');

	@property({
				  type: cc.Button,
				  tooltip: 'Booster "bomb" button.'
			  })
	boosterBomb:cc.Button = cc.assertProp(this, 'boosterBomb');

	@property({
				  type: cc.Label,
				  tooltip: 'Booster "bomb" count label.'
			  })
	boosterBombCount:cc.Label = cc.assertProp(this, 'boosterBombCount');

	private _activateTeleportAnimId!:string;
	private _activateBombAnimId!:string;
	private _teleportAnimPlayer?:AnimationStarter;
	private _bombAnimPlayer?:AnimationStarter;

	override onLoad():void {
		let ccAnim = this.boosterTeleport.getComponent(cc.Animation);
		let animIndex = 0;
		this._activateTeleportAnimId = ccAnim.getClips()[animIndex++].name;

		ccAnim = this.boosterBomb.getComponent(cc.Animation);
		animIndex = 0;
		this._activateBombAnimId = ccAnim.getClips()[animIndex++].name;
	}

	produceAnimationPlayer(manager:IAnimationPlayer):void {
		this._teleportAnimPlayer = new CCSequentAnimationByStatePlayer(
			this.boosterTeleport.getComponent(cc.Animation), manager);
		this._bombAnimPlayer = new CCSequentAnimationByStatePlayer(
			this.boosterBomb.getComponent(cc.Animation), manager);
	}

	//do not delete: for cc-editor usage only
	onBoostTeleportButtonClick():void {
		this.onBoostTeleportCallback?.();
	}

	//do not delete: for cc-editor usage only
	onBoostBombButtonClick():void {
		this.onBoostBombCallback?.();
	}

	onBoostTeleportCallback?:() => void;

	onBoostBombCallback?:() => void;

	get interactive():boolean {
		return !!this.node.getComponent(cc.BlockInputEvents)?.enabled;
	}

	enableInteraction():void {
		this.node.removeComponent(cc.BlockInputEvents);
	}

	disableInteraction():void {
		this.node.addComponent(cc.BlockInputEvents);
	}

	getReady(boosts:GameBoosters):void {

		const allBoosters = Object.values(GameplayBoostID);
		for(const boostId of allBoosters) {
			switch(boostId) {
				case GameplayBoostID.TELEPORT:
					this.boosterTeleportCount.string = `${boosts.teleport}`;
					this.boosterTeleport.interactable = boosts.teleport > 0;
					break;

				case GameplayBoostID.BOMB:
					this.boosterBombCount.string = `${boosts.bomb}`;
					this.boosterBomb.interactable = boosts.bomb > 0;
					break;

				default:
					assertNever(boostId);
			}
		}
	}

	updateBoosterCount(boostId:GameplayBoostID, count:number):Promise<void> {

		switch(boostId) {
			case GameplayBoostID.TELEPORT:
				if(count) {
					this.boosterTeleport.interactable = true;
				}

				const onCompleteTeleport = ():void => {
					this.boosterTeleportCount.string = `${count}`;
					this.boosterTeleport.interactable = count > 0;
				};

				if(this._teleportAnimPlayer) {
					return this._teleportAnimPlayer.start(this._activateTeleportAnimId).then(onCompleteTeleport);
				}

				onCompleteTeleport();
				return Promise.resolve();

			case GameplayBoostID.BOMB:
				if(count) {
					this.boosterBomb.interactable = true;
				}

				const onCompleteBomb = ():void => {
					this.boosterBombCount.string = `${count}`;
					this.boosterBomb.interactable = count > 0;
				};

				if(this._bombAnimPlayer) {
					return this._bombAnimPlayer.start(this._activateBombAnimId).then(onCompleteBomb);
				}

				onCompleteBomb();
				return Promise.resolve();

			default:
				assertNever(boostId);
		}
	}

}
