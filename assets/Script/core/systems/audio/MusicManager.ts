/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: MusicManager.ts
 * Path: assets/Script/app/core/systems/audio/
 * Author: alexeygara
 * Last modified: 2026-02-12 16:12
 */

import { GameLoopPhase }           from "core/gameloop/GameLoopPhase";
import { DelayAction }             from "core/systems/action/DelayAction";
import type { IAction }            from "core_api/action-types";
import type {
	FadeOptions,
	IAudioPlayer,
	IMusicManager,
	MusicTrack,
	Voice,
	VoiceUpdatable,
	VoiceUpdateListener
}                                  from "core_api/audio-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type { AppSystem }          from "core_api/system-types";

type FadeAction = IAction & CanBeUpdate & FinishAwait;

export class MusicManager implements IMusicManager,
									 AppSystem,
									 IGameLoopUpdatable,
									 VoiceUpdateListener {

	readonly updatePhase = GameLoopPhase.AUDIO;

	readonly name:string;

	get paused():boolean {
		return this._paused;
	}

	private _paused:boolean = false;

	get activeTrack():MusicTrack | undefined {
		return this._activeTrack;
	}

	private readonly _voice:VoiceUpdatable;
	private readonly _audioPlayer:IAudioPlayer;
	private _activeTrack:MusicTrack | undefined;
	private _fadeOutAction:FadeAction | undefined;
	private _fadeInAction:FadeAction | undefined;
	private readonly _onMusicEnd?:(musicAlias:AssetUniqueAlias, completed:boolean) => void;
	private readonly _onMusicStop?:() => void;

	private get _actualMuted():boolean {
		return this._voice.muted;
	}

	private get _actualVolume():number {
		return this._voice.volume * (this._activeTrack ? this._activeTrack.volume : 1);
	}

	constructor(
		name:string,
		voice:VoiceUpdatable,
		audioPlayer:IAudioPlayer,
		onMusicEnd:(musicAlias:AssetUniqueAlias, completed:boolean) => void,
		onMusicStop:() => void
	) {
		this.name = name;
		this._voice = voice;
		this._audioPlayer = audioPlayer;
		this._onMusicEnd = onMusicEnd;
		this._onMusicStop = onMusicStop;
	}

	async start(track:MusicTrack, options?:FadeOptions):Promise<boolean> {
		this._cancelFadeActions();

		const alias = track.alias;

		if(this._activeTrack && this._activeTrack.alias === alias) {
			this._applyTrackOptions(this._activeTrack, track, true);
			return true;
		}

		const fadeOutDelay:number = options?.fadeOutTimeSec || this._activeTrack?.fadeOptions.fadeOutTimeSec || 0;
		this._fadeOutAction = new DelayAction(this._activeTrack ? fadeOutDelay : 0);
		const fadeOutResult = await this._fadeOutAction.waitFinish();
		delete this._fadeOutAction;
		if(fadeOutResult == "cancelled") {
			return false;
		}

		if(this._activeTrack) {
			this._audioPlayer.stop(this._activeTrack.alias);
		}

		this._activeTrack = track;

		const playingWaiter = this._audioPlayer.play(alias, {
			volume: 0,
			muted: this._actualMuted,
			loop: this._activeTrack.loop
		});
		if(!playingWaiter) {
			return false;
		}

		this._voice.onUpdateCallbacks.add(this);

		playingWaiter.then((result:OnFinishResult) => {
			this._onMusicEnd?.(alias, result == 'completed');
		}, () => {
			this._onMusicEnd?.(alias, false);
		});

		const fadeInDelay:number = options?.fadeInTimeSec || this._activeTrack?.fadeOptions.fadeInTimeSec || 0;
		this._fadeInAction = new DelayAction(this._activeTrack ? fadeInDelay : 0);
		const fadeInResult = await this._fadeInAction.waitFinish();
		delete this._fadeInAction;
		if(fadeInResult == "cancelled") {
			return false;
		}

		return true;
	}

	async stop(
		immediatelyAndIgnoreFadeOutOption?:boolean,
		fadeOutTimeSec?:number,
		doNotEmitStoppedEvent?:boolean
	):Promise<void> {
		this._voice.onUpdateCallbacks.delete(this);

		this._cancelFadeActions();

		if(!this._activeTrack) {
			return;
		}

		if(immediatelyAndIgnoreFadeOutOption) {
			this._audioPlayer.stop(this._activeTrack.alias);
			if(!doNotEmitStoppedEvent) {
				this._onMusicStop?.();
			}
			return;
		}

		const alias = this._activeTrack.alias;

		const fadeOutDelay:number = fadeOutTimeSec || this._activeTrack.fadeOptions.fadeOutTimeSec || 0;
		this._fadeOutAction = new DelayAction(fadeOutDelay);
		await this._fadeOutAction.waitFinish();
		delete this._fadeOutAction;

		if(this._activeTrack) {
			this._audioPlayer.stop(alias);
		}

		delete this._activeTrack;

		if(!doNotEmitStoppedEvent) {
			this._onMusicStop?.();
		}
	}

	private _cancelFadeActions():void {
		if(this._fadeOutAction) {
			this._fadeOutAction.cancel();
			delete this._fadeOutAction;
		}
		if(this._fadeInAction) {
			this._fadeInAction.cancel();
			delete this._fadeInAction;
		}
	}

	pause():void {
		this._paused = true;

		this._audioPlayer.pause();
	}

	resume():void {
		this._paused = false;

		this._audioPlayer.resume();
	}

	update(deltaTimeMs:number):void {
		if(this._paused) {
			return;
		}

		if(this._fadeOutAction) {
			this._fadeOutAction.update?.(deltaTimeMs);

			if(this._activeTrack) {
				this._audioPlayer.setVolume(this._activeTrack.alias,
											this._actualVolume - this._actualVolume * this._fadeOutAction.progress);
			}
		}

		if(this._fadeInAction) {
			this._fadeInAction.update?.(deltaTimeMs);

			if(this._activeTrack) {
				this._audioPlayer.setVolume(this._activeTrack.alias,
											this._actualVolume * this._fadeInAction.progress);
			}
		}
	}

	onUpdateVoice(voice:Voice):void {
		if(this._activeTrack) {
			if(!this._fadeOutAction && !this._fadeInAction) {
				this._audioPlayer.setVolume(this._activeTrack.alias, this._actualVolume);
			}

			if(voice.muted) {
				this._audioPlayer.mute(this._activeTrack.alias);
			}
			else {
				this._audioPlayer.unmute(this._activeTrack.alias);
			}
		}
	}

	private _applyTrackOptions(targetTrack:MusicTrack, optionTrack:MusicTrack, targetIsPlaying:boolean):void {
		if(targetTrack.alias !== optionTrack.alias) {
			return;
		}

		if(targetTrack.loop != optionTrack.loop) {
			(targetTrack.loop as Writeable<boolean>) = optionTrack.loop;
			if(targetIsPlaying) {
				this._audioPlayer.setLoop(optionTrack.alias, optionTrack.loop);
			}
		}
		if(targetTrack.volume != optionTrack.volume) {
			(targetTrack.volume as Writeable<number>) = optionTrack.volume;
			if(targetIsPlaying) {
				this._audioPlayer.setVolume(optionTrack.alias, optionTrack.volume);
			}
		}
		if(optionTrack.fadeOptions) {
			(targetTrack.fadeOptions as Writeable<FadeOptions>) = optionTrack.fadeOptions;
		}
	}

}