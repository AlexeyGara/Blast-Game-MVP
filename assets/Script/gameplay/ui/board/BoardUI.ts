/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: BoardView.ts
 * Path: assets/Script/gameplay/views/board/
 * Author: alexeygara
 * Last modified: 2026-02-02 13:05
 */

import { GameStatus }          from "game/GameStatus";
import { getSimpleBlockIndex } from "game/logic/blocks/BlockColorType";
import {
	getSpecialBlockIndex,
	isSpecialBlock
}                              from "game/logic/blocks/BlockSpecialType";
import type {
	GameProcessResult,
	IBoardViewImpl,
	IGameProcessObserver,
	PlayerTurnFlowActor
}                              from "game_api/game-api";
import type {
	BlocksFieldData,
	ScoreInfo,
	ScoresFieldData,
	SectorsWaves
}                              from "game_api/logic-api";

//TODO: move to singleton gameplay settings
const MAX_DELAY_BETWEEN_ELEMENTS_AT_ONE_FILL_WAVE_MS = 50;
const MAX_DELAY_BETWEEN_FILL_WAVES_MS = 150;
const DELAY_BETWEEN_COLLAPSE_WAVES_MS = 200;
const DELAY_BETWEEN_FALL_DOWN_WAVES_MS = 200;
const MAX_DELAY_BETWEEN_SHAKE_WAVES_MS = 250;
const MAX_DELAY_BETWEEN_UPDATE_WAVES_MS = 50;

export class BoardUI implements PlayerTurnFlowActor,
								IGameProcessObserver {

	private readonly _boardViewImpl:IBoardViewImpl;

	constructor(
		boardComponent:IBoardViewImpl
	) {
		this._boardViewImpl = boardComponent;
	}

	/**
	 * Clear board's game-field and fill by new blocks.
	 * @param data All blocks data - blocks that fills the whole game-field.
	 * <br/>**NOTE:** The blocks should be already in place.
	 * @param waves Ordered map of sectors for adding blocks asynchronously.
	 */
	async fillWithInitialBlocks(data:BlocksFieldData, waves:SectorsWaves):Promise<void> {
		this._clearAllBlocks();

		return this.refillByNewBlocks(data, waves);
	}

	/**
	 * Fill the empty sectors of game-board with new blocks.
	 * @param data Current map of all blocks.
	 * <br/>**NOTE:** The blocks should be already in place.
	 * @param waves Ordered map of empty sectors for refill by the new blocks.
	 */
	async refillByNewBlocks(data:BlocksFieldData, waves:SectorsWaves):Promise<void> {

		const completes:Promise<void>[] = [];

		for(const wave of waves) {

			if(completes.length) {
				await wait(Math.round(MAX_DELAY_BETWEEN_FILL_WAVES_MS * Math.random()));
			}

			for(const [row, column] of wave) {

				if(completes.length) {
					await wait(Math.round(MAX_DELAY_BETWEEN_ELEMENTS_AT_ONE_FILL_WAVE_MS * Math.random()));
				}

				const blockType = data.getDataAt(row, column);

				if(isSpecialBlock(blockType)) {
					completes.push(
						this._boardViewImpl.addSpecialBlockToPos(getSpecialBlockIndex(blockType), row, column)
					);
				}
				else {
					completes.push(
						this._boardViewImpl.addSimpleBlockToPos(getSimpleBlockIndex(blockType), row, column)
					);
				}
			}
		}

		await Promise.all(completes);
	}

	/**
	 * Collapse all activated blocks at game-field according to waves order, and free up sectors empty.
	 * @param data Current map of all remaining blocks on the game-field (game-field has empty sectors).
	 * <br/>**NOTE:** The blocks should be already in place.
	 * @param waves Order map of blocks for collapse.
	 */
	async collapseBlocks(data:BlocksFieldData, waves:SectorsWaves):Promise<void> {

		const waiters:Promise<void>[] = [];

		for(const wave of waves) {

			if(waiters.length) {
				await wait(DELAY_BETWEEN_COLLAPSE_WAVES_MS);
			}

			for(const [row, column] of wave) {
				if(!data.hasDataAt(row, column)) {
					waiters.push(this._boardViewImpl.collapseBlockAtPos(row, column));
				}
			}
		}

		await Promise.all(waiters);
	}

	/**
	 *
	 * @param updateWaves Each wave at waves contains the paired sectors that should be switched: [ pick-sector, target-sector ]
	 */
	async teleportBlocks(updateWaves:SectorsWaves):Promise<void> {

		const waiters:Promise<void>[] = [];

		for(const combinedWave of updateWaves) {

			if(waiters.length) {
				await wait(Math.round(MAX_DELAY_BETWEEN_UPDATE_WAVES_MS * Math.random()));
			}

			for(let i = 0; i < combinedWave.length; i += 2) {
				const pickSector = combinedWave[i];
				const targetSector = combinedWave[i + 1];

				waiters.push(this._boardViewImpl.swipeBlocks(pickSector, targetSector));
			}

		}

		await Promise.all(waiters);
	}

	async showScores(scoreBySectors:ScoresFieldData, scoresWaves:SectorsWaves):Promise<void> {

		const waiters:Promise<void>[] = [];

		for(const wave of scoresWaves) {

			if(waiters.length) {
				await wait(DELAY_BETWEEN_COLLAPSE_WAVES_MS);
			}

			for(const [row, column] of wave) {
				const scoreInfo:ScoreInfo | 0 = scoreBySectors.getDataAt(row, column);
				if(scoreInfo) {
					waiters.push(this._boardViewImpl.addScoreInfoToPos(scoreInfo[0], row, column, scoreInfo[1]));
				}
			}
		}

		await Promise.all(waiters);
	}

	/**
	 * Fall down all the blocks suspended in the void (all blocks at the empty space of the game-field).
	 * Move down them to the bottom empty sectors.
	 * @param fromWaves Ordered map of sectors where blocks should fall down from.
	 * The order is: first waves should fall the first!
	 * @param toWaves Ordered map of sectors where blocks should fall down to.
	 * The order is: first waves should 'land' the first!
	 */
	async fallDownBlocksToEmpty(fromWaves:SectorsWaves, toWaves:SectorsWaves):Promise<void> {
		/** Inverse ordered map of sectors - the sectors where blocks should move up and then fall down. */
			//const inverseFromWaves = fromWaves.map(row => [...row].reverse()).reverse();

		const waiters:Promise<void>[] = [];

		for(let waveIndex = 0; waveIndex < fromWaves.length; waveIndex++) {

			if(waiters.length) {
				await wait(DELAY_BETWEEN_FALL_DOWN_WAVES_MS);
			}

			const fromWave = fromWaves[waveIndex];
			const toWave = toWaves[waveIndex];

			for(let posIndex = 0; posIndex < fromWave.length; posIndex++) {
				const fromPos = fromWave[posIndex];
				const toPos = toWave[posIndex];

				waiters.push(this._boardViewImpl.animateBlockToEmpty(fromPos, toPos)
								 .then(() => this._boardViewImpl.fallenDownBlockAtPos(...toPos)));

			}
		}

		return Promise.all(waiters).then();
	}

	async idleShakeBoardBlocks(waves:SectorsWaves):Promise<void> {

		for(const wave of waves) {
			for(const [row, col] of wave) {
				this._boardViewImpl.idleShakeBlock(row, col);
			}

			//TODO: move to ActionManager
			await wait(Math.round(MAX_DELAY_BETWEEN_SHAKE_WAVES_MS * Math.random()));
		}
	}

	onStartTurn():Promise<void> {

		this._boardViewImpl.enableInteraction();

		return Promise.resolve();
	}

	onBoostActivate():Promise<void> {

		this._boardViewImpl.disableInteraction();

		return Promise.resolve();
	}

	onEndTurn():Promise<void> {

		this._boardViewImpl.disableInteraction();

		return Promise.resolve();
	}

	onCompleteResult():Promise<void> {

		return Promise.resolve();
	}

	onGameProcessUpdate(gameProcessResult:GameProcessResult):Promise<void> {

		switch(gameProcessResult.status) {
			case GameStatus.READY: //switch board into the 'ready to game' state
				return Promise.resolve();

			case GameStatus.CONTINUE: //switch board into the 'continue to game' state
				return Promise.resolve();

			case GameStatus.WIN_STATUS: //disable board interactions and display WIN state
				this._boardViewImpl.disableInteraction();
				return Promise.resolve();

			case GameStatus.LOSE_STATUS: //disable board interactions and display LOSE state
				this._boardViewImpl.disableInteraction();
				return Promise.resolve();

			default:
				assertNever(gameProcessResult.status);
		}
	}

	private _clearAllBlocks():void {
		this._boardViewImpl.clearGameField();
	}

}