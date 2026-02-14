/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: SoundsManager.ts
 * Path: assets/Script/app/core/audio/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:05
 */

import { GameLoopPhase }           from "core/gameloop/GameLoopPhase";
import { Sound }                   from "core/systems/audio/Sound";
import type {
	CanBeMuted,
	CanBePlayed,
	CanChangeVolume,
	IAudioPlayer,
	ISound,
	ISoundManager,
	MasterVoiceControlled,
	Voice,
	VoiceUpdatable,
	VoiceUpdateListener
}                                  from "core_api/audio-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type {
	AppSystem,
	CanBePaused
}                                  from "core_api/system-types";

type ActiveSound = ISound & CanBePlayed & CanBePaused & MasterVoiceControlled;

type ActiveCallback = {
	readonly onComplete:() => void;
	readonly onCancel:() => void;
	resolver:Promise<OnFinishResult>;
}

export class SoundsManager implements ISoundManager,
									  AppSystem,
									  IGameLoopUpdatable,
									  VoiceUpdateListener {

	readonly updatePhase = GameLoopPhase.AUDIO;

	readonly name:string;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	private readonly _active = new Set<ActiveSound>();
	private readonly _activeCallbacks = new Map<ActiveSound, ActiveCallback>();
	private readonly _voice:VoiceUpdatable;
	private readonly _audioPlayerProvider:() => IAudioPlayer;

	constructor(
		name:string,
		voice:VoiceUpdatable,
		audioPlayerProvider:() => IAudioPlayer
	) {
		this.name = name;
		this._voice = voice;
		this._audioPlayerProvider = audioPlayerProvider;
	}

	pause():void {
		this._paused = true;

		for(const act of this._active) {
			act.pause();
		}
	}

	resume():void {
		this._paused = false;

		for(const act of this._active) {
			act.resume();
		}
	}

	play(sound:ActiveSound, loop?:boolean):Promise<OnFinishResult | false> {

		if(this._active.has(sound)) {
			const actCallbacks = this._activeCallbacks.get(sound)!;
			return Promise.resolve(actCallbacks.resolver);
		}

		const startPlayingSuccess = sound.play(this._audioPlayerProvider(), loop);
		if(!startPlayingSuccess) {
			return Promise.resolve(false);
		}

		this._active.add(sound);

		this._voice.onUpdateCallbacks.add(this);

		const actCallbacks:Writeable<DefineRequire<ActiveCallback>> = {
			onCancel: undefined,
			onComplete: undefined,
			resolver: undefined
		};

		const result:Promise<OnFinishResult> = new Promise((resolve) => {
			actCallbacks.onCancel = ():void => resolve('cancelled');
			actCallbacks.onComplete = ():void => resolve('completed');
		});

		actCallbacks.resolver = result;

		this._activeCallbacks.set(sound, actCallbacks as ActiveCallback);

		return result;
	}

	playByAlias(soundAlias:AssetUniqueAlias, loop?:boolean):
		[ISound & CanBeMuted & CanChangeVolume, Promise<OnFinishResult>];
	playByAlias(soundAlias:AssetUniqueAlias, loop?:boolean):
		[undefined, Promise<false>];
	playByAlias(soundAlias:AssetUniqueAlias, loop?:boolean):
		[(ISound & CanBeMuted & CanChangeVolume) | undefined, Promise<OnFinishResult | false>] {

		const sound:ActiveSound & CanBeMuted & CanBePaused & CanChangeVolume = new Sound(soundAlias);

		sound.setMasterVolume(this._voice.volume);
		if(this._voice.muted) {
			sound.masterMute();
		}
		else {
			sound.masterUnmute();
		}

		return [sound, this.play(sound, loop)];
	}

	stopByAlias(soundAlias:AssetUniqueAlias):boolean {
		let result = false;
		for(const act of this._active) {
			if(act.alias === soundAlias) {
				this._stop(act);
				result = true;
			}
		}
		return result;
	}

	stopAll():void {
		for(const act of this._active) {
			this._stop(act);
		}
	}

	update(deltaTimeMs:number):void {
		for(const act of this._active) {
			(act.playedTimeMs as Writeable<number>) += deltaTimeMs;
			if(act.completed || act.canceled) {
				this._resolveAndClear(act);
			}
		}
	}

	onUpdateVoice = (voice:Voice):void => {
		for(const act of this._active) {
			act.setMasterVolume(voice.volume);
			if(voice.muted) {
				act.masterMute();
			}
			else {
				act.masterUnmute();
			}
		}
	};

	private _stop(act:ActiveSound):void {
		if(this._active.has(act)) {
			act.stop();
			this._resolveAndClear(act);
		}
	}

	private _resolveAndClear(act:ActiveSound):void {
		if(this._active.delete(act)) {
			const actCallbacks = this._activeCallbacks.get(act)!;
			this._activeCallbacks.delete(act);
			if(act.completed) {
				actCallbacks.onComplete();
			}
			else if(act.canceled) {
				actCallbacks.onCancel();
			}
		}
		if(this._active.size == 0) {
			this._voice.onUpdateCallbacks.delete(this);
		}
	}

}