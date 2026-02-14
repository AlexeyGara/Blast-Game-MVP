/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameControl.ts
 * Path: assets/Script/gameplay/
 * Author: alexeygara
 * Last modified: 2026-02-02 22:45
 */

import type {
	BoostersInteractiveUI,
	GameBoardInteractiveUI,
	GameEventDispatcher,
	IGameControl
}                          from "game_api/game-api";
import type {
	Column,
	Row
}                          from "game_api/logic-api";
import type {
	IGameplayState,
	IGameplayStateContext
}                          from "game_api/states-api";
import { GameplayBoostID } from "game/boosts/BoostID";
import { GameplayEventID } from "game/event/EventID";

export class GameFlowControl implements IGameplayStateContext, IGameControl {

	private _currState?:IGameplayState;
	private _inTransition:boolean = false;
	private readonly _gameFieldInteractive:GameBoardInteractiveUI;
	private readonly _boostersInteractive:BoostersInteractiveUI;
	private _gameEventDispatcher:GameEventDispatcher;

	constructor(
		gameFieldInteractive:GameBoardInteractiveUI,
		boostersInteractive:BoostersInteractiveUI,
		gameEventDispatcher:GameEventDispatcher
	) {
		this._gameFieldInteractive = gameFieldInteractive;
		this._boostersInteractive = boostersInteractive;
		this._gameEventDispatcher = gameEventDispatcher;
	}

	private _init():void {
		this._gameFieldInteractive.onGameFieldTouchCallback = this._onTouchBlocksField;

		this._boostersInteractive.onBoostTeleportCallback = ():void => this._onBoostClick(GameplayBoostID.TELEPORT);
		this._boostersInteractive.onBoostBombCallback = ():void => this._onBoostClick(GameplayBoostID.BOMB);

		this._gameEventDispatcher.on(GameplayEventID.REFILL_BOARD, this._onRefillBoard);
		this._gameEventDispatcher.on(GameplayEventID.NEXT_TURN, this._onNextTurn);
		this._gameEventDispatcher.on(GameplayEventID.PLAYER_WON, this._onPlayerWon);
		this._gameEventDispatcher.on(GameplayEventID.PLAYER_LOST, this._onPlayerLost);
	}

	async start(initialState:IGameplayState):Promise<void> {
		this._init();

		await this.changeState(initialState);
	}

	async changeState(newState:IGameplayState):Promise<void> {
		if(this._inTransition && !this._currState?.canInterrupt) {
			return Promise.reject();
		}

		console.log(`[GameControl] Start transition to '${newState.stateId}' state:`);

		this._inTransition = true;

		await this._currState?.exit();

		this._currState = newState;

		await this._currState.enter();

		this._inTransition = false;

		console.log(`[GameControl] Transition to '${newState.stateId}' state completed!`);
	}

	private _onTouchBlocksField = (row:Row, col:Column):void => {
		console.log(`[GameControl::_onTouchBlocksField] touch ${row}-row and ${col}-column.`);
		console.log(`[GameControl::_onTouchBlocksField] ${this._currState?.stateId}`);

		this._handleIfTransitionError(
			this._currState?.goPlayerResult([row, col])
		);
	};

	private _onBoostClick(boost:GameplayBoostID):void {
		this._handleIfTransitionError(
			this._currState?.goBoostUsage(boost)
		);
	}

	private _onRefillBoard = ():void => {
		this._handleIfTransitionError(
			this._currState?.goUpdateBoard()
		);
	};

	private _onNextTurn = ():void => {
		console.log(`[GameControl::_onNextTurn]`);

		this._handleIfTransitionError(
			this._currState?.goPlayerTurn()
		);
	};

	private _onPlayerWon = ():void => {
		this._handleIfTransitionError(
			this._currState?.goPlayerWin()
		);
	};

	private _onPlayerLost = ():void => {
		this._handleIfTransitionError(
			this._currState?.goPlayerLose()
		);
	};

	private _handleIfTransitionError(result?:Promise<void>):void {
		if(result) {
			//TODO: implement a handle of the transition error
			result.catch((reason) => {
				console.warn(reason);
			});
		}
	}

}