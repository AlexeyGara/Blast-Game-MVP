/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: MusicRotator.ts
 * Path: assets/Script/core/systems/audio/
 * Author: alexeygara
 * Last modified: 2026-02-15 14:39
 */

import type { MusicTrack } from "core_api/audio-types";

type TracksLine = {
	tracks:MusicTrack[];
	trackIndex:number;
};

export class MusicRotator<TVibe extends string> {

	private _vibes:Map<TVibe, TracksLine> = new Map();

	constructor() {

	}

	register(vibe:TVibe, music:MusicTrack):void {
		const tracksAtVibe = this._vibes.get(vibe) || { tracks: [] as MusicTrack[], trackIndex: 0 };

		this._vibes.set(vibe, tracksAtVibe);

		const found = tracksAtVibe.tracks.find((track) => track.alias == music.alias);

		if(!found) {
			tracksAtVibe.tracks.push(music);
			return;
		}
	}

	remove(vibe:TVibe, music?:MusicTrack):void {
		if(!music) {
			this._vibes.delete(vibe);
			return;
		}

		const tracksAtVibe = this._vibes.get(vibe);
		if(!tracksAtVibe) {
			return;
		}

		const found = tracksAtVibe.tracks.find((track) => track.alias == music.alias);
		if(found) {
			tracksAtVibe.tracks.splice(tracksAtVibe.tracks.indexOf(found), 1);
		}
	}

	rotate(vibe?:TVibe):MusicTrack | null {
		vibe ||= this._getRandomVibe();

		if(!vibe) {
			return null;
		}

		const tracksAtVibe = this._vibes.get(vibe);

		if(!tracksAtVibe?.tracks.length) {
			return null;
		}

		const next = tracksAtVibe.tracks[tracksAtVibe.trackIndex];

		this._mixTracksAtVibe(vibe);

		if(tracksAtVibe.trackIndex++ >= tracksAtVibe.tracks.length) {
			tracksAtVibe.trackIndex = 0;
		}

		return next;
	}

	private _getRandomVibe():TVibe | undefined {
		const vibes = [...this._vibes.keys()];
		if(!vibes.length) {
			return;
		}

		return vibes[Math.round(Math.random() * (vibes.length - 1))];
	}

	private _mixTracksAtVibe(vibe:TVibe):void {
		const tracksAtVibe = this._vibes.get(vibe)!;

		const currTrack = tracksAtVibe.tracks.splice(tracksAtVibe.trackIndex, 1)[0];

		const mixedTracks:MusicTrack[] = [];
		while(tracksAtVibe.tracks.length) {
			mixedTracks.push(tracksAtVibe.tracks.splice(
				Math.round(Math.random() * (tracksAtVibe.tracks.length - 1)),
				1
			)[0]);
		}
		mixedTracks.splice(tracksAtVibe.trackIndex, 0, currTrack);
		tracksAtVibe.tracks.push(...mixedTracks);
	}
}