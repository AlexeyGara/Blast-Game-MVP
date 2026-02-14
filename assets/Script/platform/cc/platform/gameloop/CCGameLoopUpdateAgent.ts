/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CCGameLoopUpdateAgent.ts
 * Path: assets/Script/platform/cc/platform/gameloop/
 * Author: alexeygara
 * Last modified: 2026-02-12 04:54
 */

// IMPORT ON THE TOP ---> [
//import "@_global-init_";
//import { assertProp } from "../../../../global-init";
// ] <---- IMPORT ON THE TOP
import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;
import type {
	AnimationFrameReceiver,
	IFrameRequester
} from "core_api/gameloop-types";

@ccclass
@disallowMultiple
export class CCGameLoopUpdateAgent extends cc.Component implements IFrameRequester {

	private _active:boolean = false;
	private _frameReceiver:AnimationFrameReceiver | null = null;

	requestNextFrame():void {
		this._active = true;
	}

	cancelRequestedFrame():void {
		this._active = false;
	}

	setFrameReceiver(frameReceiver:AnimationFrameReceiver | null):void {
		this._frameReceiver = frameReceiver;
	}

	override update(dt:number):void {
		if(!this._active) {
			return;
		}

		this._frameReceiver?.(dt * 1000);
	}
}