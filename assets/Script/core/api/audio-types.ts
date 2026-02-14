/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: audio-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:23
 */

import type { GameLoopPhase }      from "core/gameloop/GameLoopPhase";
import type { GameLoopPhaseActor } from "core_api/gameloop-types";
import type { CanBePaused }        from "core_api/system-types";

export interface IAudioPlayer extends CanBePaused {

	/**
	 * Start a playback of sound with specified id and playing-options.
	 * @param audioAsset Sound id.
	 * @param options Playing options.
	 * @return A promise for wait a playing result: *__playback finished__*, *__canceled__* (see {@link OnFinishResult}).
	 * If cannot start a playback - '__*false*__' will be returned.
	 * <br/>**NOTE:** There is no a valid condition when this promise can be rejected.
	 */
	play(audioAsset:AssetUniqueAlias, options?:AudioOptions):Promise<OnFinishResult> | false;

	stop(audioAsset:AssetUniqueAlias):boolean;

	mute(audioAsset:AssetUniqueAlias):void;

	unmute(audioAsset:AssetUniqueAlias):void;

	setVolume(audioAsset:AssetUniqueAlias, v:number):void;

	setLoop(audioAsset:AssetUniqueAlias, loop:boolean):void;
}

export type AudioOptions = {
	readonly volume:number;
	readonly muted:boolean;
	readonly loop:boolean;
}

export interface ISound {
	readonly alias:AssetUniqueAlias;
	readonly playing:boolean;
	readonly volume:number;
	readonly muted:boolean;
	readonly completed:boolean;
	readonly canceled:boolean;

	stop():void;
}

export type CanBePlayed = {

	readonly playedTimeMs:number;

	play(audioPlayer:IAudioPlayer, loop?:boolean):boolean;

	onCompletePlaying?:(soundAlias:AssetUniqueAlias) => void;
}

export type CanBeMuted = {
	mute():void;

	unmute():void;
}

export type CanChangeVolume = {
	setVolume(v:number):void;
}

export type MasterVoiceControlled = {
	masterMute():void;

	masterUnmute():void;

	setMasterVolume(mv:number):void;
}

export type SoundStarter = {

	playByAlias(soundAlias:AssetUniqueAlias, loop?:boolean):
		[ISound & CanBeMuted & CanChangeVolume, Promise<OnFinishResult>];
	playByAlias(soundAlias:AssetUniqueAlias, loop?:boolean):
		[undefined, Promise<false>];

	play(sound:ISound & CanBePlayed & CanBePaused & MasterVoiceControlled, loop?:boolean):
		Promise<OnFinishResult | false>;
}

export interface ISoundManager extends GameLoopPhaseActor<typeof GameLoopPhase.AUDIO>,
									   SoundStarter,
									   VoiceUpdateListener {

	stopByAlias(soundAlias:AssetUniqueAlias):boolean;

	stopAll():void;
}

export type MusicTrack = {
	readonly alias:AssetUniqueAlias;
	readonly loop:boolean;
	readonly volume:number;
	readonly fadeOptions:FadeOptions;
}

export type FadeOptions = {
	/** Fade-In time in seconds */
	readonly fadeInTimeSec?:number;
	/** Fade-Out time in seconds */
	readonly fadeOutTimeSec?:number;
}

export type MusicPlayer = {

	readonly activeTrack:MusicTrack | undefined;

	start(track:MusicTrack, options?:FadeOptions):Promise<boolean>;

	resume():void;

	pause():void;

	stop(immediatelyAndIgnoreFadeOutOption?:boolean, fadeOutTimeSec?:number):Promise<void>;
}

export interface IMusicManager extends GameLoopPhaseActor<typeof GameLoopPhase.AUDIO>,
									   MusicPlayer,
									   VoiceUpdateListener {

}

export type Voice = {
	readonly name:string;
	readonly volume:number;
	readonly muted:boolean;
}

export type VoiceUpdateListener = {

	onUpdateVoice:(voice:Voice) => void;
};

export type VoiceUpdateDispatcher = {

	add:(listener:VoiceUpdateListener) => void;

	delete:(listener:VoiceUpdateListener) => boolean;
};

export type VoiceUpdatable = Voice & {

	readonly onUpdateCallbacks:VoiceUpdateDispatcher;
}

export interface IVolumeManager extends Voice {

	setVolume(v:number):void;

	mute():void;

	unmute():void;
}

export type ISoundsConsumer = {

	produceSoundsPlayer(player:SoundStarter):void;
}
