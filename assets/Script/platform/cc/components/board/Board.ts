/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: Board.ts
 * Path: assets/Script/cc/components/board/
 * Author: alexeygara
 * Last modified: 2026-02-02 13:11
 */

import { CCAnimationByTween } from "@cc_platform/animation/CCAnimationByTween";
// ] <---- IMPORT ON THE TOP
import { Block }              from "@cc_prefabs/board/Block";
import { BlocksSet }          from "@cc_prefabs/board/BlocksSet";
import { ScoreInfo }          from "@cc_prefabs/board/ScoreInfo";
import { ScoresSet }          from "@cc_prefabs/board/ScoresSet";
import type {
	IAnimationConsumer,
	IAnimationPlayer
}                             from "core_api/animation-types";
import type {
	GameBoardInteractiveUI,
	IBoardViewImpl
}                             from "game_api/game-api";
import type {
	BoardSize,
	Column,
	Row,
	SectorPos
}                             from "game_api/logic-api";
// IMPORT ON THE TOP ---> [
//import "@_global-init_";
import { assertProp }         from "../../../../global-init";
import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;
import property = cc._decorator.property;

//TODO: move to default view-settings
const DEFAULT_BLOCKS_FIELD_SIZE = { rows: 8, columns: 8 };
const DEFAULT_BLOCK_SIZE = { width: 100, height: 100 };
const DEFAULT_BLOCKS_FIELD_NAME = "gamefield";

@ccclass
@disallowMultiple
export abstract class Board extends cc.Component implements IBoardViewImpl,
															GameBoardInteractiveUI,
															BoardSize,
															IAnimationConsumer {

	@property({
				  type: cc.Integer,
				  tooltip: 'Rows count of blocks field.'
			  })
	readonly rowsCount:number = 0;

	@property({
				  type: cc.Integer,
				  tooltip: 'Columns count of blocks field.'
			  })
	readonly columnsCount:number = 0;

	@property({
				  type: cc.Size,
				  tooltip: 'Size for single block sector at blocks field.'
			  })
	readonly blockSize:cc.Size = assertProp(this, 'blockSize');

	@property({
				  type: cc.Node,
				  tooltip: 'Container for display player`s turn result scores.'
			  })
	protected readonly scoresContainer:cc.Node = cc.assertProp(this, true, () => this.scoresContainer);

	@property({
				  type: cc.Node,
				  tooltip: 'Container of animated effects of player`s result action.'
			  })
	protected readonly effectsContainer:cc.Node = cc.assertProp(this, true, () => this.effectsContainer);

	@property({
				  type: cc.Node,
				  tooltip: 'Container for all blocks.'
			  })
	protected readonly blocksContainer:cc.Node = cc.assertProp(this, true, () => this.blocksContainer);

	@property({
				  type: cc.Node,
				  tooltip: 'Container for listen touches.'
			  })
	protected readonly gameFieldContainer:cc.Node = cc.assertProp(this, true, () => this.gameFieldContainer);

	@property({
				  type: cc.Prefab,
				  tooltip: 'A set for all blocks at game-field (include special).'
			  })
	protected readonly blocksPrefab:cc.Prefab = cc.assertProp(this, true, () => this.blocksPrefab);

	@property({
				  type: cc.Prefab,
				  tooltip: 'A set for all score-infos for `scores`-container at game-field (include score-info for special blocks).'
			  })
	protected readonly scoresPrefab:cc.Prefab = cc.assertProp(this, true, () => this.scoresPrefab);

	protected override resetInEditor():void {
		const fieldNode = this.node.getChildByName(DEFAULT_BLOCKS_FIELD_NAME);
		if(!this.rowsCount) {
			(this.rowsCount as Writeable<number>) = fieldNode && fieldNode.height > DEFAULT_BLOCK_SIZE.height
													? (fieldNode.height - DEFAULT_BLOCK_SIZE.height) /
													  DEFAULT_BLOCK_SIZE.height
													: DEFAULT_BLOCKS_FIELD_SIZE.rows;
		}
		if(!this.columnsCount) {
			(this.columnsCount as Writeable<number>) = fieldNode && fieldNode.width > DEFAULT_BLOCK_SIZE.width
													   ? (fieldNode.width - DEFAULT_BLOCK_SIZE.width) /
														 DEFAULT_BLOCK_SIZE.width
													   : DEFAULT_BLOCKS_FIELD_SIZE.columns;
		}
		if(!this.blockSize || this.blockSize.width == 0 || this.blockSize.height == 0) {
			this.blockSize.width = DEFAULT_BLOCK_SIZE.width;
			this.blockSize.height = DEFAULT_BLOCK_SIZE.height;
		}
	}

	protected override onLoad():void {
		this._blocksSet = cc.instantiate(this.blocksPrefab).getComponent(BlocksSet);
		this._scoresSet = cc.instantiate(this.scoresPrefab).getComponent(ScoresSet);

		this.gameFieldContainer.on(cc.Node.EventType.TOUCH_START, this._onTouchBlocksField);
	}

	protected override onDestroy():void {
		this._blocksMap.length = 0;
	}

	produceAnimationPlayer(manager:IAnimationPlayer):void {
		this._animManager = manager;

		for(const columns of this._blocksMap) {
			for(const block of columns) {
				block?.produceAnimationPlayer(manager);
			}
		}
	}

	private _animManager?:IAnimationPlayer;

	private _blocksSet!:BlocksSet;
	private _scoresSet!:ScoresSet;

	private _blocksMap:(Block | undefined)[][] = [];

	private _getBlockAtMap(row:Row, col:Column):Block | undefined {
		this._blocksMap[row - 1] ||= [];
		return this._blocksMap[row - 1][col - 1];
	}

	private _addBlockToMap(block:Block, row:Row, col:Column):void {
		this._blocksMap[row - 1] ||= [];
		this._blocksMap[row - 1][col - 1] = block;
	};

	private _removeBlockFromMap(row:Row, col:Column):Block | undefined {
		if(!this._blocksMap[row - 1]) {
			return;
		}

		const block = this._blocksMap[row - 1][col - 1];

		this._blocksMap[row - 1][col - 1] = undefined;

		return block;
	}

	get interactive():boolean {
		return !!this.gameFieldContainer.getComponent(cc.BlockInputEvents)?.enabled;
	}

	enableInteraction():void {
		//this.gameFieldContainer.resumeSystemEvents(false);
		this.gameFieldContainer.removeComponent(cc.BlockInputEvents);
	}

	disableInteraction():void {
		//this.gameFieldContainer.pauseSystemEvents(false);
		this.gameFieldContainer.addComponent(cc.BlockInputEvents);
	}

	getSectorPosFromWorldPoint(worldPoint:cc.Vec2):SectorPos {
		const localPoint = this.gameFieldContainer.convertToNodeSpaceAR(worldPoint);
		//localPoint.x = Math.max(0, Math.min(localPoint.x, this.blockSize.width * this.columnsCount));
		//localPoint.y = Math.max(0, Math.min(localPoint.y, this.blockSize.height * this.rowsCount));
		return this.getSectorPosFromLocalPoint(localPoint);
	}

	getSectorPosFromLocalPoint(localPoint:cc.Vec2):SectorPos {
		const row = Math.max(1, Math.min(this.rowsCount,
										 Math.ceil(localPoint.y / this.blockSize.height)));
		const column = Math.max(1, Math.min(this.columnsCount,
											Math.ceil(localPoint.x / this.blockSize.width)));
		return [row, column];
	}

	localPointFromSectorPos(row:Row, column:Column):cc.Vec2 {
		return new cc.Vec2(
			(column - 1) * this.blockSize.width,
			(row - 1) * this.blockSize.height
		);
	}

	worldPointFromSectorPos(row:Row, column:Column):cc.Vec2 {
		const localPoint = this.localPointFromSectorPos(row, column);
		return this.gameFieldContainer.convertToWorldSpace(localPoint);
	}

	/**
	 * Create a simple block and add it to game-board.
	 * @param blockColorIndex Index of color type of block, starts with 0.
	 * @param row Index of game-board row, starts with 1.
	 * @param column Index of game-board column, starts with 1.
	 * @return A waiter for 'finish' event of `appear` animation of block.
	 */
	addSimpleBlockToPos(blockColorIndex:number, row:Row, column:Column):Promise<void> {
		return this._createAndAddBlock(this._blocksSet.simpleBlocksList[blockColorIndex],
									   row, column);
	}

	/**
	 * Create a special block and add it to game-board.
	 * @param blockTypeIndex Index of type of special block, starts with 0.
	 * @param row Index of game-board row, starts with 1.
	 * @param column Index of game-board column, starts with 1.
	 * @return A waiter for 'finish' event of `appear` animation of block.
	 */
	addSpecialBlockToPos(blockTypeIndex:number, row:Row, column:Column):Promise<void> {
		return this._createAndAddBlock(this._blocksSet.specialBlocksList[blockTypeIndex], row, column);
	}

	addScoreInfoToPos(scoreValue:number, row:Row, column:Column, isSpecialType?:boolean):Promise<void> {
		const prefab = isSpecialType ? this._scoresSet.specialBlocksScore
									 : this._scoresSet.simpleBlocksScore;
		const score = this._createAndAdd(prefab, row, column,
										 this.scoresContainer,
										 ScoreInfo);
		if(!score) {
			return Promise.resolve(void 0);
		}

		score.produceAnimationPlayer(this._animManager!);

		this._updateZIndex(score, row, column);

		return score.show(scoreValue).then(() => {
			this.scoresContainer.removeChild(score.node);
		});
	}

	async collapseBlockAtPos(row:Row, column:Column):Promise<void> {
		const blockNode = this._removeBlockFromMap(row, column);
		if(!blockNode) {
			return Promise.resolve();
		}

		await blockNode.startDisappearAnim();

		this.blocksContainer.removeChild(blockNode.node);

		//TODO: implement a pool logic for blocks: release to pool
	}

	animateBlockToEmpty(fromPos:SectorPos, toEmptyPos:SectorPos):Promise<void> {
		const [fRow, fCol] = fromPos;

		const block = this._removeBlockFromMap(fRow, fCol);
		if(!block) {
			return Promise.resolve();
		}

		const [tRow, tCol] = toEmptyPos;
		const distance = Math.max(Math.abs(fRow - tRow), Math.abs(fCol - tCol));

		return this._animateToEmpty(block, toEmptyPos, 0.1 * distance);
	}

	private async _animateToEmpty(block:Block, toEmptyPos:SectorPos, duration:number):Promise<void> {
		const [row, col] = toEmptyPos;

		this._addBlockToMap(block, row, col);
		this._updateZIndex(block, row, col);

		const targetPoint = this.localPointFromSectorPos(row, col);

		const anim = new CCAnimationByTween(
			cc.tween(block.node).to(duration, {
				x: targetPoint.x,
				y: targetPoint.y
			}, { easing: /*'sineIn'*/'cubicIn' })
		);

		await this._animManager?.play(anim);
	}

	async fallenDownBlockAtPos(row:Row, col:Column):Promise<void> {
		const block = this._removeBlockFromMap(row, col);
		if(!block) {
			return;
		}

		await block.startFallenDowAnim();

		this._addBlockToMap(block, row, col);
		this._updateZIndex(block, row, col);
	}

	idleShakeBlock(row:Row, col:Column):void {
		const block = this._getBlockAtMap(row, col);
		block?.playShakeAnim();
	}

	async swipeBlocks(pickPos:SectorPos, targetPos:SectorPos):Promise<void> {
		const [pRow, pCol] = pickPos;
		const [tRow, tCol] = targetPos;

		const distance = Math.max(Math.abs(pRow - tRow), Math.abs(pCol - tCol));

		const pickBlock = this._removeBlockFromMap(...pickPos);
		const targetBlock = this._removeBlockFromMap(...targetPos);

		if(!pickBlock || !targetBlock) {
			console.error('NO BLOCk');
		}

		const waiters:Promise<void>[] = [];

		waiters.push(this._animateToEmpty(pickBlock!, targetPos, 0.1 * distance).then(() => {
			this.idleShakeBlock(...targetPos);
		}));

		waiters.push(this._animateToEmpty(targetBlock!, pickPos, 0.1 * distance).then(() => {
			this.idleShakeBlock(...pickPos);
		}));

		return Promise.all(waiters).then();
	}

	clearGameField():void {
		//TODO: implement a pool logic for blocks and score-infos: release all children to pool
		this._blocksMap.length = 0;
		this.blocksContainer.removeAllChildren(true);
		this.effectsContainer.removeAllChildren(true);
		this.scoresContainer.removeAllChildren(true);
	}

	onGameFieldTouchCallback?:(row:Row, column:Column) => void;

	private _createAndAddBlock(prefab:cc.Prefab, row:Row, column:Column):Promise<void> {
		const block = this._createAndAdd(prefab, row, column,
										 this.blocksContainer,
										 Block);
		if(!block) {
			return Promise.resolve(void 0);
		}

		block.produceAnimationPlayer(this._animManager!);

		this._addBlockToMap(block, row, column);
		this._updateZIndex(block, row, column);

		return block.startAppearAnim();
	}

	private _createAndAdd<TccClass>(prefab:cc.Prefab, row:Row, column:Column, container:cc.Node,
									ccClass:Constructable<TccClass>):TccClass {

		//TODO: implement a pool logic for blocks and score-infos: get from pool
		const instance = cc.instantiate(prefab);

		this._setPosToBlockNode(instance, row, column);
		container.addChild(instance);

		return instance.getComponent(ccClass);
	}

	private _updateZIndex(blockOrScore:Block | ScoreInfo, row:Row, col:Column):void {
		if(!blockOrScore || !blockOrScore.node) {
			console.error(`ERROR`);
		}

		blockOrScore.node.zIndex = row * this.columnsCount + col;
	}

	private _setPosToBlockNode(blockNode:cc.Node, row:Row, column:Column):void {
		const localPoint = this.localPointFromSectorPos(row, column);
		blockNode.x = localPoint.x;
		blockNode.y = localPoint.y;
	}

	private _onTouchBlocksField = (event:cc.Event.EventTouch):void => {
		const worldPoint = event.getLocation();

		this.onGameFieldTouchCallback?.(...this.getSectorPosFromWorldPoint(worldPoint));
	};
}