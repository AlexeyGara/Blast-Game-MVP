/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Main.ts
 * Path: assets/Script/
 * Author: alexeygara
 * Last modified: 2026-02-10 00:56
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
//import { assertProp } from "@_global-init_";
import { assertProp }              from "./global-init";
// ] <---- IMPORT ON THE TOP
import { Board }                   from "@cc_components/board/Board";
import { Boosters }                from "@cc_components/boosters/Boosters";
import { Hud }                     from "@cc_components/hud/Hud";
import { CCAudioPlayer }           from "@cc_platform/audio/CCAudioPlayer";
import { CCGameLoopUpdateAgent }   from "@cc_platform/gameloop/CCGameLoopUpdateAgent";
import { BlocksSet }               from "@cc_prefabs/board/BlocksSet";
import { ScoresSet }               from "@cc_prefabs/board/ScoresSet";
import {
	isAppSystem,
	isDestroyable,
	isGameLoopActor
}                                  from "core/core-utils";
import { EventBus }                from "core/event/EventBus";
import { GameLoop }                from "core/gameloop/GameLoop";
import { ActionManager }           from "core/systems/action/ActionManager";
import { AnimationManager }        from "core/systems/animation/AnimationManager";
import { AudioVoice }              from "core/systems/audio/AudioVoice";
import { MusicManager }            from "core/systems/audio/MusicManager";
import { SoundsManager }           from "core/systems/audio/SoundsManager";
import { PauseManager }            from "core/systems/PauseManager";
import type { IActionManager }     from "core_api/action-types";
import type {
	IAnimationManager
}                                  from "core_api/animation-types";
import type { AppSettingsDTO }     from "core_api/app-settings";
import type {
	IAudioPlayer,
	IMusicManager,
	ISoundManager
}                                  from "core_api/audio-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type { IPauseManager }      from "core_api/system-types";
import { GameFlowControl }         from "game/GameFlowControl";
import { BlocksField }             from "game/logic/blocks/BlocksField";
import { ScoreFieldData }          from "game/logic/score/ScoreFieldData";
import { GameProcessMapper }       from "game/service/GameProcessMapper";
import { GameplayStateID }         from "game/state/GameFlowStateID";
import { StatesFactory }           from "game/state/StatesFactory";
import { StrategiesProvider }      from "game/state/StrategiesProvider";
import { GameProcessModel }        from "game/turn_cycle/GameProcessModel";
import { PlayerTurnModel }         from "game/turn_cycle/PlayerTurnModel";
import { BoardUI }                 from "game/ui/board/BoardUI";
import { BoostsUI }                from "game/ui/boosts/BoostsUI";

import { HudUI }                 from "game/ui/hud/HudUI";
import type {
	GameContext,
	GameProcessResult,
	IGameProcessResultAgent,
	IPlayerTurnResultAgent
}                                from "game_api/game-api";
import type { GameSettingsDTO }  from "game_api/game-settings";
import type { LevelSettingsDTO } from "game_api/level-settings";
import type { PlayerTurnResult } from "game_api/logic-api";
import { StoreService }          from "services/StoreService";
import { UserService }           from "services/UserService";

const { ccclass, property } = cc._decorator;
import disallowMultiple = cc._decorator.disallowMultiple;

@ccclass
@disallowMultiple
export default class Main extends cc.Component {

	@property(cc.JsonAsset)
	appSettings:cc.JsonAsset = assertProp(this, 'appSettings');

	@property(cc.JsonAsset)
	levelSettings:cc.JsonAsset = assertProp(this, 'levelSettings');

	@property({
				  type: Hud,
				  tooltip: 'Link to HUD view.'
			  })
	hud:Hud = assertProp(this, 'hud');

	@property({
				  type: Board,
				  tooltip: 'Link to Board view.'
			  })
	board:Board = assertProp(this, 'board');

	@property({
				  type: Boosters,
				  tooltip: 'Link to Boosters buttons block.'
			  })
	boosters:Boosters = cc.assertProp(this, 'boosters');

	@property({
				  type: BlocksSet
			  })
	blockSet:BlocksSet = cc.assertProp(this, 'blockSet');

	@property({
				  type: ScoresSet
			  })
	scoreSet:ScoresSet = cc.assertProp(this, 'scoreSet');

	@property({
				  type: CCGameLoopUpdateAgent
			  })
	gameLoopUpdateProvider:CCGameLoopUpdateAgent = cc.assertProp(this, 'gameLoopUpdateProvider');

	private _gameLoop!:GameLoop;
	private _pauseManager!:IPauseManager;

	override onLoad():void {
		//The target node must be placed in the root level of hierarchy, otherwise this API won't have any effect.
		cc.game.addPersistRootNode(this.node);

		this._gameLoop = new GameLoop();
		this._pauseManager = new PauseManager('GLOBAL: Pause Manager');
		this._pauseManager.addSystem(this._gameLoop);

		cc.log("MAIN LOADED");
	}

	override onEnable():void {
		cc.log("MAIN ENABLE");

		this._gameLoop.start(this.gameLoopUpdateProvider, true);
		this._pauseManager.resume();
	}

	override start():void {
		this._init();

		cc.log(`MAIN STARTED`);
	}

	override onDisable():void {
		cc.log("MAIN ENABLE");

		this._pauseManager.pause();
		this._gameLoop.stop();
	}

	override onDestroy():void {
		cc.log("MAIN START DESTROY");

		this._gameLoop.stop();
	}

	private _init():void {

		const appSettings:AppSettingsDTO = this.appSettings.json;
		const gameplaySettings:GameSettingsDTO = appSettings.gameSettings;
		const levelSettings:LevelSettingsDTO = this.levelSettings.json;

		const commonReleaseMethod = (instance:object, pauseManager?:IPauseManager):void => {
			if(isGameLoopActor(instance)) {
				this._gameLoop.remove(instance);
			}
			if(isAppSystem(instance)) {
				pauseManager?.removeSystem(instance);
			}
			if(isDestroyable(instance)) {
				instance.destroy();
			}
		};

		console.log(appSettings);
		console.log(levelSettings);

		//TODO: move instancing to DI-containers

		// cc-platform -->[
		let lastAudioPlayerImplIndex = 0;
		const ccAudioPlayerProvider = ():IAudioPlayer => {
			const player = new CCAudioPlayer(`PLATFORM: ccAudio Player #${++lastAudioPlayerImplIndex}`);
			this._pauseManager.addSystem(player);
			return player;
		};
		// ]<-- cc-platform

		// singleton scope -->[
		const appEventBus = new EventBus();
		const globalAudioVoice = new AudioVoice('GLOBAL: Audio Voice');
		const globalMusicVolumeControl = new AudioVoice('GLOBAL: Music Volume', globalAudioVoice);
		const globalSoundsVolumeControl = new AudioVoice('GLOBAL: Sounds Volume', globalAudioVoice);
		const globalMusicManager = new MusicManager('GLOBAL: Music Manager', globalMusicVolumeControl,
													ccAudioPlayerProvider(),
													(musicAlias, completed) => {
														void appEventBus.emit('APP.MUSIC.ENDED',
																			  { musicAlias, completed });
													},
													() => {
														void appEventBus.emit('APP.MUSIC.STOPPED', void 0);
													});

		const gameplayEventBus = new EventBus();

		// UI -->[
		const hudUI = new HudUI(this.hud);
		const boardUI = new BoardUI(this.board);
		const boostsUI = new BoostsUI(this.boosters);
		// ]<-- UI

		const blockField = new BlocksField(this.board);
		const scoreField = new ScoreFieldData(this.board);

		const playerTurnResult:PlayerTurnResult & IPlayerTurnResultAgent
				  = new PlayerTurnModel(() => scoreField, scoreField);
		const gameProcessResult:GameProcessResult & IGameProcessResultAgent
				  = new GameProcessModel(levelSettings);
		// ]<-- singleton scope

		const ctx:GameContext = {

			boardView: boardUI,

			boardDataProvider: () => blockField,
			boardDataEditor: blockField,

			eventDispatcher: gameplayEventBus,
			eventEmitter: gameplayEventBus,

			settings: {
				gameplay: gameplaySettings,
				currLevel: () => levelSettings
			},

			gameProcess: {

				playerTurnModelProvider: () => playerTurnResult,
				playerTurnResultAgent: playerTurnResult,
				playerTurnFlowActorsOrderedList: [
					//update turn result the first
					playerTurnResult,
					//update game process mode based on turn result
					gameProcessResult,
					//update all views based on game process result
					[
						hudUI,
						boardUI,
						boostsUI
					],
				],

				gameProcessModelProvider: () => gameProcessResult,
				gameProcessResultAgent: gameProcessResult,
				gameProcessResultObservers: [
					hudUI,
					boardUI,
					boostsUI
				]
			},

			systems: {
				pause: {
					provide: (setName:string, masterPauseManager?:IPauseManager) => {
						const manager = new PauseManager(setName, masterPauseManager || this._pauseManager);
						return [manager, ():void => ctx.systems.pause.release(manager)];
					},
					release: (manager:IPauseManager):void => {
						if(manager != this._pauseManager && isDestroyable(manager)) {
							manager.destroy();
						}
					}
				},
				actions: {
					provide: (setName:string, pauseManager?:IPauseManager) => {
						const manager = new ActionManager(setName);
						// logic phase: add
						this._gameLoop.add(manager);
						pauseManager?.addSystem(manager);
						return [manager, ():void => ctx.systems.actions.release(manager, pauseManager)];
					},
					release: (manager:IActionManager, pauseManager?:IPauseManager):void => {
						manager.cancelAll();
						commonReleaseMethod(manager, pauseManager);
					}
				},
				animations: {
					provide: (setName:string, pauseManager?:IPauseManager) => {
						const manager = new AnimationManager(setName);
						// animation phase: add
						this._gameLoop.add(manager);
						pauseManager?.addSystem(manager);
						return [manager, ():void => ctx.systems.animations.release(manager, pauseManager)];
					},
					release: (manager:IAnimationManager, pauseManager?:IPauseManager):void => {
						manager.cancelAll();
						commonReleaseMethod(manager, pauseManager);
					}
				},
				sounds: {
					provide: (setName:string, pauseManager?:IPauseManager) => {
						const manager = new SoundsManager(setName, globalSoundsVolumeControl, ccAudioPlayerProvider);
						// audio phase: add
						this._gameLoop.add(manager);
						pauseManager?.addSystem(manager);
						return [manager, ():void => ctx.systems.sounds.release(manager, pauseManager)];
					},
					release: (manager:ISoundManager, pauseManager?:IPauseManager):void => {
						manager.stopAll();
						commonReleaseMethod(manager, pauseManager);
					},
				},
				music: {
					provide: ():IMusicManager => globalMusicManager,
				},
			},

			consumers: {
				animations: [
					this.board,
					this.boosters,
					this.hud
				]
			},

			services: {
				gameProcessMapper: new GameProcessMapper(),
				storeService: new StoreService(),
				userProgressSaveService: new UserService()
			}
		};

		this._gameLoopInit([
							   // input phase [
							   // ]

							   // logic phase [
							   appEventBus,
							   gameplayEventBus,
							   // ]

							   // animation phase [
							   // ]

							   // audio phase [
							   globalMusicManager
							   // ]

							   // render phase
						   ]);

		const gameControl = new GameFlowControl(this.board, this.boosters, ctx.eventDispatcher);

		const stateStrategiesProvider = new StrategiesProvider(ctx);

		const gameStatesFactory = new StatesFactory(gameControl, stateStrategiesProvider, ctx);

		console.log(gameControl);

		gameControl.start(gameStatesFactory.getState(GameplayStateID.BOARD_READY)).then(() => {
			console.info("GAME CONTROL STARTED");
		}).catch((reason) => {
			console.error("GAME CONTROL ERROR", reason);
		});
	}

	private _gameLoopInit(updatableList:IGameLoopUpdatable[]):void {

		for(const updateTarget of updatableList) {
			this._gameLoop.add(updateTarget);
		}
	}

}
