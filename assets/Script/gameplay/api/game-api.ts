/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: game-api.ts
 * Path: assets/Script/gameplay/api/
 * Author: alexeygara
 * Last modified: 2026-02-03 13:47
 */

import type { IAnimationConsumer } from "core_api/animation-types";
import type {
	IEventDispatcher,
	IEventEmitter
}                                  from "core_api/event-types";
import type { HaveInteraction }    from "core_api/input-types";
import type {
	IGameStoreService,
	IUserProgressSaver
}                                  from "core_api/service-types";
import type { SystemsProvider }    from "core_api/system-types";
import type { IGameplayState }     from "game/api/states-api";
import type { GameplayBoostID }    from "game/boosts/BoostID";
import type { GameStatus }         from "game/GameStatus";
import type { GameProcessMapper }  from "game/service/GameProcessMapper";
import type { BoardUI }            from "game/ui/board/BoardUI";
import type { GameplayEvent }      from "game_api/event-api";
import type { GameSettingsDTO }    from "game_api/game-settings";
import type { LevelSettingsDTO }   from "game_api/level-settings";
import type {
	BlocksFieldData,
	BlocksFieldEditor,
	BlockType,
	Column,
	GameBoosters,
	PlayerTurnResult,
	Row,
	ScoreInfo,
	SectorPos,
	SectorsWave,
	SectorsWaves
}                                  from "./logic-api";

export type GameContext = Readonly<{

	boardView:BoardUI;

	boardDataProvider:() => BlocksFieldData;
	boardDataEditor:BlocksFieldEditor;

	eventEmitter:GameEventEmitter;
	eventDispatcher:GameEventDispatcher;

	settings:{
		gameplay:GameSettingsDTO;
		currLevel:() => LevelSettingsDTO;
	};

	gameProcess:{
		playerTurnModelProvider:() => PlayerTurnResult;
		playerTurnResultAgent:IPlayerTurnResultAgent;
		playerTurnFlowActorsOrderedList:Readonly<Iterable<PlayerTurnFlowActor | PlayerTurnFlowActor[]>>;

		gameProcessModelProvider:() => GameProcessResult;
		gameProcessResultAgent:IGameProcessResultAgent;
		gameProcessResultObservers:Readonly<IGameProcessObserver[]>;
	};

	systems:{
		pause:SystemsProvider['pauseManager'];
		actions:SystemsProvider['actionsManager'];
		animations:SystemsProvider['animationsManager'];
		sounds:SystemsProvider['soundsManager'];
		music:SystemsProvider['musicManager'];
	};

	consumers:{
		animations:IAnimationConsumer[];
	};

	services:{
		gameProcessMapper:GameProcessMapper;
		storeService:IGameStoreService;
		userProgressSaveService:IUserProgressSaver;
	};
}>;

export type GameProcessResult = Readonly<{

	status:GameStatus;

	totalScore:number;
	scoreToWin:number;

	turnsCompleted:number;
	turnsLeft:number;

	boosters:GameBoosters;
}>;

export type PlayerTurnFlowActor = {

	/**
	 * Called when _**'wait-player-turn'**_ mode starts.
	 */
	onStartTurn():Promise<void>;

	/**
	 * Called when boost was activated while _**'wait-player-turn'**_ mode is running.
	 * @param boostId
	 * @param boostsLeft
	 */
	onBoostActivate(boostId:GameplayBoostID, boostsLeft:GameBoosters):Promise<void>;

	//onBoostResult(turnResult:PlayerTurnResult, gameProcessResult:GameProcessResult):Promise<void>;

	/**
	 * Called after _**'wait-player-turn'**_ mode is completed and before the _**'turn-result-calculation'**_ _(update the {@link #PlayerTurnResult})_ is started.
	 * @param turnsCompleted Count of turns the player made.
	 * @param turnsLeft Count of available turns the player can do.
	 */
	onEndTurn(turnsCompleted:number, turnsLeft:number):Promise<void>;

	/**
	 * Called after the _**'turn-result-calculation'**_ completed _({@link #PlayerTurnResult} updated)_ and the _**'game-process-result'**_ _({@link #GameProcessResult})_ updated exclude _**'game-status'**_ _({@link #GameStatus})_.
	 * <br/>**WARNING:** The  _**'game-status'**_ _({@link #GameStatus})_ not updated yet!
	 * @param turnResult A link to actually updated {@link #PlayerTurnResult}
	 * @param gameProcessResult A link to actually updated {@link #GameProcessResult}
	 */
	onCompleteResult(turnResult:PlayerTurnResult, gameProcessResult:GameProcessResult):Promise<void>;
}

export interface IGameProcessObserver {

	/**
	 * Called when the _**'game-status'**_ _({@link #GameStatus})_ is updated.
	 * @param model A link to actually updated {@link #GameProcessResult} include _**'game-status'**_ _({@link #GameStatus})_.
	 */
	onGameProcessUpdate(model:GameProcessResult):Promise<void>;
}

export interface IGameProcessResolver {

	resolve(gameProcess:GameProcessResult):GameStatus;
}

export interface IPlayerTurnResultAgent extends PlayerTurnFlowActor {

	addScore(value:number):void;

	addToScoreInfoValue(scoreInfo:ScoreInfo, sector:SectorPos):void;

	setScoresWaves(waves:SectorsWaves):void;

	addReward(reward:GameBoosters):void;
}

export interface IGameProcessResultAgent extends PlayerTurnFlowActor {

	enterBooster(booster:GameplayBoostID):void;

	setStatus(status:GameStatus):void;
}

export type GameEventEmitter = IEventEmitter<GameplayEvent>;

export type GameEventDispatcher = IEventDispatcher<GameplayEvent>;

export interface IGameControl {

	start(initialState:IGameplayState):Promise<void>;
}

export type ScoreCalculation = {

	scoreByBlock:ScoreByBlockCalculator;
	scoreByWave:ScoreBonusByWaveCalculator;
};

export type ScoreByBlockCalculator = (blockType:BlockType) => number;

/** Index of collapsing blocks wave. Starts with 1, not 0. */
export type WaveIndex = number;

export type ScoreBonusByWaveCalculator = (wave:SectorsWave, waveIndex:WaveIndex) => number[];

export type RewardByScoreCalculator = (score:number, waves:SectorsWaves) => GameBoosters;

export type GameBoardInteractiveUI = {

	onGameFieldTouchCallback?:(row:Row, column:Column) => void;
}

export type BoostersInteractiveUI = {

	onBoostTeleportCallback?:() => void;

	onBoostBombCallback?:() => void;
}

export interface IBoardViewImpl extends HaveInteraction {

	/**
	 * Create a simple block and add it to game-board.
	 * @param blockColorIndex Index of color type of block, starts with 0.
	 * @param row Index of game-board row, starts with 1.
	 * @param column Index of game-board column, starts with 1.
	 * @return A waiter for 'finish' event of `appear` animation of block.
	 */
	addSimpleBlockToPos(blockColorIndex:number, row:Row, column:Column):Promise<void>;

	/**
	 * Create a special block and add it to game-board.
	 * @param blockTypeIndex Index of type of special block, starts with 0.
	 * @param row Index of game-board row, starts with 1.
	 * @param column Index of game-board column, starts with 1.
	 * @return A waiter for 'finish' event of `appear` animation of block.
	 */
	addSpecialBlockToPos(blockTypeIndex:number, row:Row, column:Column):Promise<void>;

	addScoreInfoToPos(scoreValue:number, row:Row, column:Column, isSpecialType?:boolean):Promise<void>;

	collapseBlockAtPos(row:Row, column:Column):Promise<void>;

	animateBlockToEmpty(fromPos:SectorPos, toPos:SectorPos):Promise<void>;

	fallenDownBlockAtPos(row:Row, col:Column):Promise<void>;

	idleShakeBlock(row:Row, col:Column):void;

	swipeBlocks(pickPos:SectorPos, targetPos:SectorPos):Promise<void>;

	clearGameField():void;
}

export interface IHudViewImpl {

	getReady(turnsCount:number, scoreToWin:number):void;

	turnCountUpdate(value:number):Promise<void>;

	scoreCountUpdate(score:number, scoreToWin?:number):Promise<void>;

	gameStatusUpdate(status:GameStatus):Promise<void>;
}

export interface IBoostsViewImpl extends HaveInteraction {

	getReady(boosts:GameBoosters):void;

	updateBoosterCount(boostId:GameplayBoostID, count:number):Promise<void>;
}
