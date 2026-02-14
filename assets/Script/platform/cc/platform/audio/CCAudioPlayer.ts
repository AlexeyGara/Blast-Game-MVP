/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: CCAudioPlayer.ts
 * Path: assets/Script/platform/cc/platform/audio/
 * Author: alexeygara
 * Last modified: 2026-02-12 17:51
 */

import type {
	AudioOptions,
	IAudioPlayer
}                         from "core_api/audio-types";
import type { AppSystem } from "core_api/system-types";

export class CCAudioPlayer implements IAudioPlayer,
									  AppSystem {

	readonly name:string;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	constructor(
		name:string
	) {
		this.name = name;
	}

	pause():void {
		//TODO: implement
	}

	resume():void {
		//TODO: implement
	}

	play(audioAsset:AssetUniqueAlias, options?:AudioOptions):Promise<OnFinishResult> | false {
		//TODO: implement
		console.log(audioAsset, options);
		return false;
	}

	stop(audioAsset:AssetUniqueAlias):boolean {
		//TODO: implement
		console.log(audioAsset);
		return false;
	}

	setLoop(audioAsset:AssetUniqueAlias, loop:boolean):void {
		//TODO: implement
		console.log(audioAsset, loop);
	}

	setVolume(audioAsset:AssetUniqueAlias, v:number):void {
		//TODO: implement
		console.log(audioAsset, v);
	}

	mute(audioAsset:AssetUniqueAlias):void {
		//TODO: implement
		console.log(audioAsset);
	}

	unmute(audioAsset:AssetUniqueAlias):void {
		//TODO: implement
		console.log(audioAsset);
	}
}