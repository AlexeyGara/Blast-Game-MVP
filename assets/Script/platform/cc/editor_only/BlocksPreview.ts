/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: BlocksPreview.ts
 * Path: assets/Script/editor_only/
 * Author: alexeygara
 * Last modified: 2026-02-01 20:01
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
//import { assertProp } from "@_global-init_";
// ] <---- IMPORT ON THE TOP

const { ccclass } = cc._decorator;

//TODO: This class should be removed at a final build.

@ccclass
export default abstract class BlocksPreview extends cc.Component {

	override onLoad():void {
		if(CC_EDITOR) {
			// @ts-expect-error This class should be removed at final build.
			this.node._objFlags |= cc.Flags.DontSave;
		}
		else {
			// На всякий случай
			this.node.destroy();
		}
	}
}
