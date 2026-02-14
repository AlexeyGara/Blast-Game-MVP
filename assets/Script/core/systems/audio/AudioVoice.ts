/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Chesstles-TS
 * File: AudioVoice.ts
 * Author: alexeygara
 * Last modified: 2026-01-12 01:34
 */

import type {
	IVolumeManager,
	Voice,
	VoiceUpdatable,
	VoiceUpdateDispatcher,
	VoiceUpdateListener
} from "core_api/audio-types";

export class AudioVoice implements IVolumeManager,
								   Voice,
								   VoiceUpdatable,
								   VoiceUpdateListener {

	readonly name:string;

	get muted():boolean {
		return this._muted || !!this._masterVoice?.muted;
	}

	get volume():number {
		return this._volume * (this._masterVoice?.volume ?? 1);
	}

	readonly onUpdateCallbacks:VoiceUpdateDispatcher = {
		add: (listener:VoiceUpdateListener) => {
			this._listeners.add(listener);

			this._masterVoice?.onUpdateCallbacks.add(this);
		},

		delete: (listener:VoiceUpdateListener) => {
			const res = this._listeners.delete(listener);

			if(this._listeners.size == 0) {
				this._masterVoice?.onUpdateCallbacks.delete(this);
			}

			return res;
		}
	};

	private _muted:boolean = false;
	private _volume:number = 1;
	private readonly _masterVoice:Voice & VoiceUpdatable | undefined;
	private readonly _listeners:Set<VoiceUpdateListener> = new Set<VoiceUpdateListener>();

	constructor(
		name:string,
		masterVoice?:Voice & VoiceUpdatable
	) {
		this.name = name;
		this._masterVoice = masterVoice;
	}

	mute():void {
		if(this._muted) {
			return;
		}

		this._muted = true;
		this._dispatchUpdate();
	}

	unmute():void {
		if(!this._muted) {
			return;
		}

		this._muted = false;
		this._dispatchUpdate();
	}

	setVolume(v:number):void {
		if(this._volume == v) {
			return;
		}

		this._volume = Math.max(0, Math.min(1, v));
		this._dispatchUpdate();
	}

	private _dispatchUpdate():void {
		for(const listener of this._listeners) {
			listener.onUpdateVoice(this);
		}
	}

	onUpdateVoice():void {
		this._dispatchUpdate();
	}
}