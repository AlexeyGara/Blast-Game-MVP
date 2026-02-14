/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Hud.ts
 * Path: assets/Script/platform/cc/components/hud/
 * Author: alexeygara
 * Last modified: 2026-02-10 06:54
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
import { assertProp }                       from "../../../../global-init";
// ] <---- IMPORT ON THE TOP
import { TurnsCounter }                     from "@cc_components/hud/TurnsCounter";
import { CCParallelAnimationByStatePlayer } from "@cc_platform/animation/CCParallelAnimationByStatePlayer";
import type {
	AnimationStarter,
	IAnimationConsumer,
	IAnimationPlayer
}                                           from "core_api/animation-types";
import { GameStatus }                       from "game/GameStatus";
import type { IHudViewImpl }                from "game_api/game-api";

import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;
import property = cc._decorator.property;

//TODO: move to singleton gameplay settings
const SCORE_VALUE_ROUND_BASE = 1;//10;

@ccclass
@disallowMultiple
export abstract class Hud extends cc.Component implements IHudViewImpl,
														  IAnimationConsumer {

	@property({
				  type: cc.Node,
				  tooltip: 'Turns counter block with decrease animation.'
			  })
	protected readonly turnsCounter:cc.Node = assertProp(this, true, () => this.turnsCounter);
	@property({
				  type: cc.Label,
				  tooltip: 'Turns count label.'
			  })
	protected readonly turnsCountLabel:cc.Label = cc.assertProp(this, true, () => this.turnsCountLabel);
	@property({
				  type: cc.Node,
				  tooltip: 'Score panel.'
			  })
	protected readonly scorePanel:cc.Node = assertProp(this, true, () => this.scorePanel);
	@property({
				  type: cc.Label,
				  tooltip: 'Score count label.'
			  })
	protected readonly scoreCountLabel:cc.Label = cc.assertProp(this, true, () => this.scoreCountLabel);

	private _decreaseTurnsCountAnimId!:string;
	private _turnsCounterLoseAnimId!:string;
	private _turnsCounterWinAnimId!:string;
	private _increaseScoreCountAnimId!:string;
	private _scoreCounterLoseAnimId!:string;
	private _scoreCounterWinAnimId!:string;
	private _turnsCounterPlayer?:AnimationStarter;
	private _scoreCounterPlayer?:AnimationStarter;
	private _turnCounterComponent!:TurnsCounter;
	private _turnsCount:number = 0;
	private _currScore:number = 0;
	private _scoreToWin:number = 0;

	protected override onLoad():void {
		let ccAnim = this.turnsCounter.getComponent(cc.Animation);
		let animIndex = 0;
		this._decreaseTurnsCountAnimId = ccAnim.getClips()[animIndex++].name;
		this._turnsCounterLoseAnimId = ccAnim.getClips()[animIndex++].name;
		this._turnsCounterWinAnimId = ccAnim.getClips()[animIndex++].name;

		this._turnCounterComponent = this.turnsCounter.getComponent(TurnsCounter);

		animIndex = 0;
		ccAnim = this.scorePanel.getComponent(cc.Animation);
		this._increaseScoreCountAnimId = ccAnim.getClips()[animIndex++].name;
		this._scoreCounterLoseAnimId = ccAnim.getClips()[animIndex++].name;
		this._scoreCounterWinAnimId = ccAnim.getClips()[animIndex++].name;

		this.scoreCountLabel.overflow = cc.Label.Overflow.SHRINK;

		this.getReady(0, 0);
	}

	protected override onDestroy():void {
		delete this._turnCounterComponent.onAnimPeak;
	}

	produceAnimationPlayer(manager:IAnimationPlayer):void {
		this._turnsCounterPlayer = new CCParallelAnimationByStatePlayer(
			this.turnsCounter.getComponent(cc.Animation), manager);
		this._scoreCounterPlayer = new CCParallelAnimationByStatePlayer(
			this.scorePanel.getComponent(cc.Animation), manager);
	}

	getReady(turnsCount:number, scoreToWin:number):void {
		turnsCount |= 0;

		this._turnsCount = turnsCount;
		this._currScore = 0;
		this._scoreToWin = Math.round(scoreToWin * SCORE_VALUE_ROUND_BASE) / SCORE_VALUE_ROUND_BASE;

		this.turnsCountLabel.string = `${turnsCount}`;
		this.scoreCountLabel.string = `0/${this._scoreToWin}`;
	}

	async turnCountUpdate(turnsCount:number):Promise<void> {
		turnsCount |= 0;

		if(this._turnsCount == turnsCount) {
			return;
		}

		this._turnsCount = turnsCount;

		this._turnCounterComponent.onAnimPeak = ():void => {
			this.turnsCountLabel.string = `${this._turnsCount}`;
		};

		await this._turnsCounterPlayer?.start(this._decreaseTurnsCountAnimId);

		this.turnsCountLabel.string = `${this._turnsCount}`;
	}

	async scoreCountUpdate(currScore:number, scoreToWin?:number):Promise<void> {
		currScore = Math.round(currScore * SCORE_VALUE_ROUND_BASE) / SCORE_VALUE_ROUND_BASE;
		scoreToWin ||= this._scoreToWin;
		scoreToWin = Math.round(scoreToWin * SCORE_VALUE_ROUND_BASE) / SCORE_VALUE_ROUND_BASE;

		if(this._currScore == currScore) {
			return;
		}

		this._currScore = currScore;
		this._scoreToWin = scoreToWin;

		await this._scoreCounterPlayer?.start(this._increaseScoreCountAnimId);

		this.scoreCountLabel.string = `${this._currScore}/${this._scoreToWin}`;
	}

	gameStatusUpdate(status:GameStatus):Promise<void> {
		switch(status) {
			case GameStatus.LOSE_STATUS:
				return Promise.all([
									   this._turnsCounterPlayer?.start(this._turnsCounterLoseAnimId),
									   this._scoreCounterPlayer?.start(this._scoreCounterLoseAnimId)
								   ]).then();

			case GameStatus.WIN_STATUS:
				return Promise.all([
									   this._turnsCounterPlayer?.start(this._turnsCounterWinAnimId),
									   this._scoreCounterPlayer?.start(this._scoreCounterWinAnimId)
								   ]).then();

			case GameStatus.READY:
			case GameStatus.CONTINUE:
				return Promise.resolve();

			default:
				assertNever(status);
		}
	}

}