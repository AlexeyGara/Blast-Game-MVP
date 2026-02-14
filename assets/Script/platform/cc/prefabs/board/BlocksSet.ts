/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: BlocksSet.ts
 * Path: assets/Script/cc/prefabs/board/
 * Author: alexeygara
 * Last modified: 2026-02-01 22:57
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
//import { assertProp } from "@_global-init_";
// ] <---- IMPORT ON THE TOP

import { BlockColorType }   from "game/logic/blocks/BlockColorType";
import { BlockSpecialType } from "game/logic/blocks/BlockSpecialType";
import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;
import property = cc._decorator.property;

//cc.Enum(EBlockColor);
//cc.Enum(EBlockSpecialType);

const blockColorsCount = 5;//Object.keys(EBlockColor).length;
const blocksSpecialCount = 4;//Object.keys(EBlockSpecialType).length;

@ccclass
@disallowMultiple
export abstract class BlocksSet extends cc.Component {

	@property({
				  type: [cc.Prefab],
				  tooltip: `Set of simple colored blocks (Fixed length ${blockColorsCount})`,
				  displayName: `Colored block`
			  })
	simpleBlocksList:cc.Prefab[] = [];

	@property({
				  type: [cc.Prefab],
				  tooltip: `Set of special blocks (Fixed length ${blocksSpecialCount})`,
				  displayName: `Special block`
			  })
	specialBlocksList:cc.Prefab[] = [];

	override resetInEditor():void {
		if(this.simpleBlocksList.length === 0) {
			this.simpleBlocksList = new Array(Object.keys(BlockColorType).length).fill(null);
		}
		if(this.specialBlocksList.length === 0) {
			this.specialBlocksList = new Array(Object.keys(BlockSpecialType).length).fill(null);
		}
	}

}
