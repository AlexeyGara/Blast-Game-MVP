/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: StatesFactory.ts
 * Path: assets/Script/gameplay/states/
 * Author: alexeygara
 * Last modified: 2026-02-01 13:49
 */

import { GameplayBoostID }           from "game/boosts/BoostID";
import { BoardReady }                from "game/state/states/BoardReady";
import { BoardUpdate }               from "game/state/states/BoardUpdate";
import { PlayerBoost }               from "game/state/states/PlayerBoost";
import type { GameContext }          from "game_api/game-api";
import type {
	GameplayStatesFactory,
	GameplayStatesGuards,
	IGameplayState,
	IGameplayStateContext,
	StateStrategyProvider
}                                    from "game_api/states-api";
import type { GameplayStatePayload } from "./GameFlowStateID";
import { GameplayStateID }           from "./GameFlowStateID";
import { PlayerLoseState }           from "./states/PlayerLoseState";
import { PlayerResultState }         from "./states/PlayerResultState";
import { PlayerTurnState }           from "./states/PlayerTurnState";
import { PlayerWinState }            from "./states/PlayerWinState";

export class StatesFactory implements GameplayStatesFactory {

	private readonly _context:IGameplayStateContext;
	private readonly _stateStrategyProvider:StateStrategyProvider;
	private readonly _gameplayCtx:GameContext;

	constructor(
		context:IGameplayStateContext,
		stateStrategyProvider:StateStrategyProvider,
		gameplayCtx:GameContext
	) {
		this._context = context;
		this._stateStrategyProvider = stateStrategyProvider;
		this._gameplayCtx = gameplayCtx;
	}

	getState(stateId:typeof GameplayStateID.BOARD_READY,
			 payload:GameplayStatePayload[typeof GameplayStateID.BOARD_READY])
		:IGameplayState<typeof GameplayStateID.BOARD_READY>;
	getState(stateId:typeof GameplayStateID.BOARD_UPDATE,
			 payload:GameplayStatePayload[typeof GameplayStateID.BOARD_UPDATE])
		:IGameplayState<typeof GameplayStateID.BOARD_UPDATE>;
	getState(stateId:typeof GameplayStateID.PLAYER_TURN,
			 payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_TURN])
		:IGameplayState<typeof GameplayStateID.PLAYER_TURN>;
	getState(stateId:typeof GameplayStateID.PLAYER_RESULT,
			 payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_RESULT])
		:IGameplayState<typeof GameplayStateID.PLAYER_RESULT>;
	getState(stateId:typeof GameplayStateID.PLAYER_WIN,
			 payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_WIN])
		:IGameplayState<typeof GameplayStateID.PLAYER_WIN>;
	getState(stateId:typeof GameplayStateID.PLAYER_LOSE,
			 payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_LOSE])
		:IGameplayState<typeof GameplayStateID.PLAYER_LOSE>;
	getState(stateId:GameplayStateID, payload:GameplayStatePayload[GameplayStateID]):IGameplayState {

		switch(stateId) {
			case GameplayStateID.BOARD_READY:
				return new BoardReady(this._context, this,
									  ...this._stateStrategyProvider.getStrategies(stateId, void 0));

			case GameplayStateID.PLAYER_TURN:
				return new PlayerTurnState(this._context, this,
										   this._provideGuards(),
										   ...this._stateStrategyProvider.getStrategies(stateId, void 0));

			case GameplayStateID.PLAYER_BOOST:
				const boostStatePayload = payload as GameplayStatePayload[typeof stateId];
				return new PlayerBoost(this._context, this,
									   ...this._stateStrategyProvider.getStrategies(stateId, boostStatePayload),
									   this._provideGuards());

			case GameplayStateID.PLAYER_RESULT:
				const resultStatePayload = payload as GameplayStatePayload[typeof stateId];
				return new PlayerResultState(this._context, this,
											 ...this._stateStrategyProvider.getStrategies(stateId, resultStatePayload),
											 this._provideGuards());

			case GameplayStateID.PLAYER_WIN:
				return new PlayerWinState(this._context, this,
										  ...this._stateStrategyProvider.getStrategies(stateId, void 0));

			case GameplayStateID.PLAYER_LOSE:
				return new PlayerLoseState(this._context, this,
										   ...this._stateStrategyProvider.getStrategies(stateId, void 0));

			case GameplayStateID.BOARD_UPDATE:
				return new BoardUpdate(this._context, this,
									   ...this._stateStrategyProvider.getStrategies(stateId, void 0),
									   this._provideGuards());

			default:
				assertNever(stateId);
		}
	}

	private _provideGuards():GameplayStatesGuards {

		const alwaysAllowGuard = {
			canTransit: <TStateID extends GameplayStateID>(_:GameplayStatePayload[TStateID]):boolean => true
		};

		return {
			[GameplayStateID.BOARD_READY]: alwaysAllowGuard,

			[GameplayStateID.BOARD_UPDATE]: alwaysAllowGuard,

			[GameplayStateID.PLAYER_BOOST]: {
				canTransit: (payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_BOOST]):boolean => {

					const gameProcess = this._gameplayCtx.gameProcess.gameProcessModelProvider();

					switch(payload.boost) {
						case GameplayBoostID.TELEPORT:
							return gameProcess.boosters.teleport > 0;

						case GameplayBoostID.BOMB:
							return gameProcess.boosters.bomb > 0;

						default:
							assertNever(payload.boost);
					}
				}
			},

			[GameplayStateID.PLAYER_TURN]: {
				canTransit: (_:GameplayStatePayload[typeof GameplayStateID.PLAYER_TURN]):boolean => {

					return this._gameplayCtx.gameProcess.gameProcessModelProvider().turnsLeft > 0;
				}
			},

			[GameplayStateID.PLAYER_RESULT]: alwaysAllowGuard,

			[GameplayStateID.PLAYER_LOSE]: alwaysAllowGuard,

			[GameplayStateID.PLAYER_WIN]: alwaysAllowGuard,
		};
	}
}