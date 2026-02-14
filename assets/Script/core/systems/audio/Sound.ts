/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Sound.ts
 * Path: assets/Script/app/core/systems/audio/
 * Author: alexeygara
 * Last modified: 2026-02-12 14:30
 */

import type {
	CanBeMuted,
	CanBePlayed,
	CanChangeVolume,
	IAudioPlayer,
	ISound,
	MasterVoiceControlled
}                           from "core_api/audio-types";
import type { CanBePaused } from "core_api/system-types";

export class Sound implements ISound,
							  CanBePlayed,
							  CanBeMuted,
							  CanBePaused,
							  CanChangeVolume,
							  MasterVoiceControlled {

	readonly alias:AssetUniqueAlias;

	readonly playedTimeMs:number = 0;

	get playing():boolean {
		return !!this._audioPlayer;
	}

	get paused():boolean {
		return this._paused;
	}

	get completed():boolean {
		return this._completed;
	}

	get canceled():boolean {
		return this._canceled;
	}

	get muted():boolean {
		return this._muted;
	}

	get volume():number {
		return this._volume;
	}

	private _paused:boolean = false;
	private _canceled:boolean = false;
	private _completed:boolean = false;
	private _muted:boolean = false;
	private _volume:number = 1;
	private _audioPlayer:IAudioPlayer | undefined;
	private _masterVolume:number = 1;
	private _masterMuted:boolean = false;

	private get _actualMuted():boolean {
		return this.muted || this._masterMuted;
	}

	private get _actualVolume():number {
		return this.volume * this._masterVolume;
	}

	constructor(
		alias:AssetUniqueAlias,
		volume:number = 1
	) {
		this.alias = alias;
		this._volume = volume;
	}

	play(audioPlayer:IAudioPlayer, loop?:boolean):boolean {
		if(this.playing) {
			return true;
		}

		const plyingWaiter = audioPlayer.play(this.alias, {
			volume: this._actualVolume,
			muted: this._actualMuted,
			loop: loop || false
		});
		if(!plyingWaiter) {
			return false;
		}

		// set 'playing' to 'true'
		this._audioPlayer = audioPlayer;

		this._completed = false;
		this._canceled = false;
		(this.playedTimeMs as Writeable<number>) = 0;

		plyingWaiter.then(() => {
			if(!this.playing) {
				return;
			}

			this._completed = true;

			// set 'playing' to 'false'
			delete this._audioPlayer;
		}, () => {
			if(!this.playing) {
				return;
			}

			this._canceled = true;

			// set 'playing' to 'false'
			delete this._audioPlayer;
		});

		return true;
	}

	stop():void {
		if(!this.playing) {
			return;
		}

		this._canceled = true;

		if(this._audioPlayer) {
			this._audioPlayer.stop(this.alias);

			// set 'playing' to 'false'
			delete this._audioPlayer;
		}
	}

	pause():void {
		if(this.paused) {
			return;
		}

		this._paused = true;

		this._audioPlayer?.pause();
	}

	resume():void {
		if(!this.paused) {
			return;
		}

		this._paused = false;

		this._audioPlayer?.resume();
	}

	setVolume(v:number):void {
		if(this.volume == v) {
			return;
		}

		this._volume = Math.max(0, Math.min(1, v));
		this._updateVolumeIfPlaying();
	}

	setMasterVolume(mv:number):void {
		if(this._masterVolume == mv) {
			return;
		}

		this._masterVolume = Math.max(0, Math.min(1, mv));
		this._updateVolumeIfPlaying();
	}

	private _updateVolumeIfPlaying():void {
		// if 'playing' is 'true'
		if(this._audioPlayer) {
			this._audioPlayer.setVolume(this.alias, this._actualVolume);
		}
	}

	mute():void {
		if(this.muted) {
			return;
		}

		this._muted = true;
		this._updateMuteIfPlaying();
	}

	unmute():void {
		if(!this.muted) {
			return;
		}

		this._muted = false;
		this._updateMuteIfPlaying();
	}

	masterMute():void {
		if(this._masterMuted) {
			return;
		}

		this._masterMuted = true;
		this._updateMuteIfPlaying();
	}

	masterUnmute():void {
		if(!this._masterMuted) {
			return;
		}

		this._masterMuted = false;
		this._updateMuteIfPlaying();
	}

	private _updateMuteIfPlaying():void {
		// if 'playing' is 'true'
		if(this._audioPlayer) {
			if(this._actualMuted) {
				this._audioPlayer.mute(this.alias);
			}
			else {
				this._audioPlayer.unmute(this.alias);
			}
		}
	}

}