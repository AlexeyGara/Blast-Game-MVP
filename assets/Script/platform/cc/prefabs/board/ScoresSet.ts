/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: ScoresSet.ts
 * Path: assets/Script/cc/prefabs/board/
 * Author: alexeygara
 * Last modified: 2026-02-05 01:28
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
import { assertProp } from "../../../../global-init";
// ] <---- IMPORT ON THE TOP
import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;
import property = cc._decorator.property;

@ccclass
@disallowMultiple
export abstract class ScoresSet extends cc.Component {

	@property({
				  type: cc.Prefab,
				  tooltip: `A prefab of score-info for simple colored blocks.`,
				  //displayName: `Simple block's score-info`
			  })
	simpleBlocksScore:cc.Prefab = assertProp(this, 'simpleBlocksScore');

	@property({
				  type: cc.Prefab,
				  tooltip: `A prefab of score-info for any special block.`,
				  //displayName: `Special block's score-info`
			  })
	specialBlocksScore:cc.Prefab = cc.assertProp(this, 'specialBlocksScore');

}