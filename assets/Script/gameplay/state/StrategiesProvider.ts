/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: StrategiesProvider.ts
 * Path: assets/Script/gameplay/states/
 * Author: alexeygara
 * Last modified: 2026-02-09 13:31
 */

import { GameLoopPhase }                   from "core/gameloop/GameLoopPhase";
import type { IActionManager }             from "core_api/action-types";
import type {
	IAnimation,
	IAnimationManager
}                                          from "core_api/animation-types";
import { GameplayBoostID }                 from "game/boosts/BoostID";
import { GameplayEventID }                 from "game/event/EventID";
import { GameStatus }                      from "game/GameStatus";
import { blockActionProvider }             from "game/logic/blocks/actions/block-action-provider";
import { isSimpleBlock }                   from "game/logic/blocks/BlockColorType";
import { FallDownFromBlocksMethod }        from "game/logic/field/methods/FallDownFromBlocksMethod";
import { FallDownToBlocksMethod }          from "game/logic/field/methods/FallDownToBlocksMethod";
import { FillFullBoardMethod }             from "game/logic/field/methods/FillFullBoardMethod";
import { PickRandomBlocksMethod }          from "game/logic/field/methods/PickRandomBlocksMethod";
import { ProcessBlocksByInitialOneMethod } from "game/logic/field/methods/ProcessBlocksByInitialOneMethod";
import { ProcessBoostBombMethod }          from "game/logic/field/methods/ProcessBoostBombMethod";
import { ProcessBoostTeleportMethod }      from "game/logic/field/methods/ProcessBoostTeleportMethod";
import { RefillBoardMethod }               from "game/logic/field/methods/RefillBoardMethod";
import {
	calculateRewardByBombBoostProvider,
	calculateRewardByScoresProvider
}                                          from "game/logic/reward/calculate-reward-by-scores-provider";
import { calculateScoreByBlock }           from "game/logic/score/calculation/calculate-score-by-block";
import {
	calculationScoreByBombBoostWave,
	calculationScoreByWave
}                                          from "game/logic/score/calculation/calculation-score-by-wave";
import type { GameplayStatePayload }       from "game/state/GameFlowStateID";
import { GameplayStateID }                 from "game/state/GameFlowStateID";
import { BoostUpdateGameField }            from "game/state/strategies/BoostUpdateGameField";
import { CancelAllActiveActions }          from "game/state/strategies/exit/CancelAllActiveActions";
import { CancelAllActiveAnimations }       from "game/state/strategies/exit/CancelAllActiveAnimations";
import { GameResolveStatus }               from "game/state/strategies/GameResolveStatus";
import { HandleBoostActivated }            from "game/state/strategies/HandleBoostActivated";
import { HandleResultComplete }            from "game/state/strategies/HandleResultComplete";
import { HandleTurnModeEnded }             from "game/state/strategies/HandleTurnModeEnded";
import { HandleTurnModeStarted }           from "game/state/strategies/HandleTurnModeStarted";
import { PlayerHandleLostStatus }          from "game/state/strategies/PlayerHandleLostStatus";
import { PlayerWaitTurnAction }            from "game/state/strategies/PlayerWaitTurnAction";
import { UIInitialiseToStart }             from "game/state/strategies/UIInitialiseToStart";
import { UserStoreGameProcess }            from "game/state/strategies/UserStoreGameProcess";
import { GameResultResolver }              from "game/turn_cycle/GameResultResolver";
import type { GameContext }                from "game_api/game-api";
import type {
	BlocksDataMethod,
	BlockType
}                                          from "game_api/logic-api";
import type {
	StateStrategy,
	StateStrategyProvider
}                                          from "game_api/states-api";
import { BoardPrepareToGame }              from "./strategies/BoardPrepareToGame";
import { BoardRefillEmptySectors }         from "./strategies/BoardRefillEmptySectors";
import { PlayerCalculateTurnResult }       from "./strategies/PlayerCalculateTurnResult";
import { PlayerHandleWinStatus }           from "./strategies/PlayerHandleWinStatus";

export class StrategiesProvider implements StateStrategyProvider {

	private readonly _gameCtx:GameContext;
	private _animProxy?:IAnimationManager;

	constructor(
		gameContext:GameContext
	) {
		this._gameCtx = gameContext;
	}

	getStrategies(stateId:typeof GameplayStateID.BOARD_READY,
				  payload:GameplayStatePayload[typeof GameplayStateID.BOARD_READY]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:typeof GameplayStateID.BOARD_UPDATE,
				  payload:GameplayStatePayload[typeof GameplayStateID.BOARD_UPDATE]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:typeof GameplayStateID.PLAYER_TURN,
				  payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_TURN]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:typeof GameplayStateID.PLAYER_RESULT,
				  payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_RESULT]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:typeof GameplayStateID.PLAYER_WIN,
				  payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_WIN]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:typeof GameplayStateID.PLAYER_LOSE,
				  payload:GameplayStatePayload[typeof GameplayStateID.PLAYER_LOSE]):[StateStrategy[], StateStrategy[]];
	getStrategies(stateId:GameplayStateID,
				  payload:GameplayStatePayload[GameplayStateID]):[StateStrategy[], StateStrategy[]] {

		const ctx = this._gameCtx;
		const gameProcess = this._gameCtx.gameProcess;
		const currLevelSettings = this._gameCtx.settings.currLevel();

		const [actionsManager, releaseActionManager]
				  = ctx.systems.actions.provide(`${stateId}: Actions Manager`);

		let [animationManager, releaseAnimationManager]
				  = ctx.systems.animations.provide(`${stateId}: Animation Manager`);

		ctx.consumers.animations.map((consumer) =>
										 consumer.produceAnimationPlayer(animationManager));

		//TODO: remove this proxy manager
		if(stateId != GameplayStateID.PLAYER_TURN) {
			this._animProxy ||= {
				updatePhase: GameLoopPhase.ANIMATION,
				play: (animation:IAnimation & CanBeUpdate):Promise<OnFinishResult> => {
					return animationManager.play(animation);
				},
				cancel: ():void => {
				},
				cancelAllByTag: ():void => {
				},
				cancelAll: ():void => {
				}

			};
			animationManager = this._animProxy;
			releaseAnimationManager = ():void => void 0;
		}

		switch(stateId) {
			case GameplayStateID.BOARD_READY:
				return [[
					new UIInitialiseToStart(gameProcess.gameProcessResultObservers,
											gameProcess.gameProcessModelProvider),
					new BoardPrepareToGame(ctx.boardView,
										   new FillFullBoardMethod(
											   ctx.boardDataProvider, ctx.boardDataEditor,
											   new RefillBoardMethod(ctx.boardDataProvider,
																	 ctx.boardDataEditor,
																	 currLevelSettings))),
					this.provideNextTurnStrategy()
				],
					this._getDefaultExitStrategies(true,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.BOARD_UPDATE:
				return [[
					new BoardRefillEmptySectors(ctx.boardView,
												new FallDownFromBlocksMethod(ctx.boardDataProvider),
												new FallDownToBlocksMethod(
													ctx.boardDataProvider, ctx.boardDataEditor,
													new FallDownFromBlocksMethod(ctx.boardDataProvider)),
												new RefillBoardMethod(ctx.boardDataProvider,
																	  ctx.boardDataEditor,
																	  currLevelSettings)),
					this.provideNextTurnStrategy()
				],
					this._getDefaultExitStrategies(true,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.PLAYER_TURN:
				return [[
					new HandleTurnModeStarted(gameProcess.playerTurnFlowActorsOrderedList),
					new PlayerWaitTurnAction(ctx.boardView,
											 currLevelSettings,
											 actionsManager,
											 new PickRandomBlocksMethod(ctx.boardDataProvider, {
												 blocksToPickMin: currLevelSettings.behaviour.BLOCKS_TO_IDLE_SHAKE_MIN,
												 blocksToPickMax: currLevelSettings.behaviour.BLOCKS_TO_IDLE_SHAKE_MAX,
												 maxBlocksAtOneWave: currLevelSettings.behaviour.MAX_BLOCKS_AT_ONE_IDLE_SHAKE_WAVE
											 })),
					// wait player interaction
					this.provideIdleStrategy()
				],
					this._getDefaultExitStrategies(false,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.PLAYER_BOOST:
				const boostStatePayload = payload as GameplayStatePayload[typeof stateId];
				return [[
					new HandleBoostActivated(boostStatePayload.boost,
											 gameProcess.gameProcessResultAgent,
											 gameProcess.gameProcessModelProvider,
											 gameProcess.playerTurnFlowActorsOrderedList),
					new BoostUpdateGameField(boostStatePayload.boost,
											 ctx.boardView,
											 gameProcess.playerTurnModelProvider,
											 this._getBoostUpdateMethod(boostStatePayload.boost)),
					new HandleResultComplete(gameProcess.playerTurnModelProvider,
											 gameProcess.gameProcessModelProvider,
											 gameProcess.playerTurnFlowActorsOrderedList),
					new UserStoreGameProcess(ctx.boardDataProvider,
											 gameProcess.gameProcessModelProvider,
											 ctx.services.gameProcessMapper,
											 ctx.services.storeService,
											 ctx.services.userProgressSaveService),
					new GameResolveStatus(gameProcess.gameProcessModelProvider,
										  gameProcess.gameProcessResultAgent,
										  new GameResultResolver(),
										  gameProcess.gameProcessResultObservers),
					this.provideGameStatusStrategy()
				],
					this._getDefaultExitStrategies(true,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.PLAYER_RESULT:
				const resultStatePayload = payload as GameplayStatePayload[typeof stateId];
				return [[
					new HandleTurnModeEnded(gameProcess.gameProcessModelProvider,
											gameProcess.playerTurnFlowActorsOrderedList),
					new PlayerCalculateTurnResult(ctx.boardView,
												  gameProcess.playerTurnModelProvider,
												  new ProcessBlocksByInitialOneMethod(
													  ctx.boardDataProvider, ctx.boardDataEditor,
													  resultStatePayload.activeBlock,
													  gameProcess.playerTurnModelProvider,
													  gameProcess.playerTurnResultAgent,
													  (blockType) => blockActionProvider(blockType,
																						 ctx.settings.gameplay),
													  () => ({
														  scoreByBlock: calculateScoreByBlock,
														  scoreByWave: calculationScoreByWave,
													  }),
													  () => calculateRewardByScoresProvider(currLevelSettings)
												  )),
					new HandleResultComplete(gameProcess.playerTurnModelProvider,
											 gameProcess.gameProcessModelProvider,
											 gameProcess.playerTurnFlowActorsOrderedList),
					new UserStoreGameProcess(ctx.boardDataProvider,
											 gameProcess.gameProcessModelProvider,
											 ctx.services.gameProcessMapper,
											 ctx.services.storeService,
											 ctx.services.userProgressSaveService),
					new GameResolveStatus(gameProcess.gameProcessModelProvider,
										  gameProcess.gameProcessResultAgent,
										  new GameResultResolver(),
										  gameProcess.gameProcessResultObservers),
					this.provideGameStatusStrategy()
				],
					this._getDefaultExitStrategies(true,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.PLAYER_WIN:
				return [[
					new PlayerHandleWinStatus(),
					this.provideGameEndStrategy()
				],
					this._getDefaultExitStrategies(false,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			case GameplayStateID.PLAYER_LOSE:
				return [[
					new PlayerHandleLostStatus(),
					this.provideGameEndStrategy()
				],
					this._getDefaultExitStrategies(false,
												   actionsManager, releaseActionManager,
												   animationManager, releaseAnimationManager)
				];

			default:
				assertNever(stateId);
		}
	}

	provideIdleStrategy = ():StateStrategy => ({
		perform: ():Promise<void> => Promise.resolve()
	});

	provideNextTurnStrategy = ():StateStrategy => ({
		perform: ():Promise<void> => {
			return this._gameCtx.eventEmitter.emit(GameplayEventID.NEXT_TURN, void 0);
		}
	});

	provideGameStatusStrategy = ():StateStrategy => ({
		perform: ():Promise<void> => {
			const gameProcessResult = this._gameCtx.gameProcess.gameProcessModelProvider();

			switch(gameProcessResult.status) {
				case GameStatus.READY:
				case GameStatus.CONTINUE:
					return this._gameCtx.eventEmitter.emit(GameplayEventID.REFILL_BOARD, void 0);

				case GameStatus.WIN_STATUS:
					return this._gameCtx.eventEmitter.emit(GameplayEventID.PLAYER_WON, void 0);

				case GameStatus.LOSE_STATUS:
					return this._gameCtx.eventEmitter.emit(GameplayEventID.PLAYER_LOST, void 0);

				default:
					assertNever(gameProcessResult.status);
			}
		}
	});

	provideGameEndStrategy = ():StateStrategy => ({
		perform: ():Promise<void> => {
			return this._gameCtx.eventEmitter.emit(GameplayEventID.GAME_END, void 0);
		}
	});

	private _getBoostUpdateMethod(boostId:GameplayBoostID):BlocksDataMethod {
		const ctx = this._gameCtx;
		const gameProcess = this._gameCtx.gameProcess;
		const gameSettings = this._gameCtx.settings.gameplay;
		const levelSettings = this._gameCtx.settings.currLevel();
		const boardData = this._gameCtx.boardDataProvider();

		switch(boostId) {
			case GameplayBoostID.TELEPORT:
				return new ProcessBoostTeleportMethod(ctx.boardDataProvider,
													  ctx.boardDataEditor,
													  new PickRandomBlocksMethod(
														  ctx.boardDataProvider,
														  {
															  blocksToPickMin: gameSettings.boosts.teleport.BLOCKS_TO_ACTIVATE_MIN
																			   || boardData.rows * boardData.columns,
															  blocksToPickMax: gameSettings.boosts.teleport.BLOCKS_TO_ACTIVATE_MAX,
															  maxBlocksAtOneWave: gameSettings.boosts.teleport.MAX_BLOCKS_AT_ONE_WAVE
														  },
														  (blockType:BlockType) => isSimpleBlock(blockType),
													  ));

			case GameplayBoostID.BOMB:
				return new ProcessBoostBombMethod(ctx.boardDataProvider,
												  ctx.boardDataEditor,
												  gameProcess.playerTurnModelProvider,
												  gameProcess.playerTurnResultAgent,
												  () => ({
													  scoreByBlock: calculateScoreByBlock,
													  scoreByWave: calculationScoreByBombBoostWave,
												  }),
												  () => calculateRewardByBombBoostProvider(levelSettings));

			default:
				assertNever(boostId);
		}
	}

	private _getDefaultExitStrategies(cancelWithComplete:boolean,
									  actionManager:IActionManager, releaseActionManager:() => void,
									  animationManager:IAnimationManager,
									  releaseAnimationManager:() => void):StateStrategy[] {
		return [
			new CancelAllActiveActions(actionManager, cancelWithComplete, releaseActionManager),
			new CancelAllActiveAnimations(animationManager, cancelWithComplete, releaseAnimationManager)
		];
	}

}