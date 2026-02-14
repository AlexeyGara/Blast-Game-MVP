/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: Gameloop.ts
 * Path: assets/Script/app/core/gameloop/
 * Author: alexeygara
 * Last modified: 2026-02-09 03:33
 */

import type { GameLoopPhase }       from "core/gameloop/GameLoopPhase";
import { OrderedGameLoopPhases }    from "core/gameloop/GameLoopPhase";
import { GameTime as GameTimeImpl } from "core/gameloop/GameTime";
import type {
	IFrameRequester,
	IGameLoopUpdatable,
	IGameLoopUpdater,
	IGameTimeAgent,
	IScaledGameTime
}                                   from "core_api/gameloop-types";
import type { AppSystem }           from "core_api/system-types";

const MAX_DELTA_TIME_THRESHOLD:number = 1000;

type RenderMethod = () => void;

export class GameLoop implements IGameLoopUpdater,
								 AppSystem {

	readonly name:string = 'GameLoop-Cycle-System-Manager';

	get paused():boolean {
		return this._paused;
	}

	private _running:boolean = false;
	private _frameRequester?:IFrameRequester;
	private readonly _gameTime:IScaledGameTime & IGameTimeAgent;
	private readonly _updatableSystems = new Map<GameLoopPhase, IGameLoopUpdatable[]>();
	private _renderMethod?:RenderMethod;
	private _ignoreRenderPhase:boolean = false;
	private _paused:boolean = false;

	constructor() {
		this._gameTime = new GameTimeImpl(MAX_DELTA_TIME_THRESHOLD);
	}

	init(renderMethod?:RenderMethod):void {
		this._renderMethod = renderMethod;
	}

	start(frameRequester:IFrameRequester,
		  ignoreRenderPhase:boolean = false):void {
		if(this._running) {
			return;
		}

		this._running = true;

		this._frameRequester = frameRequester;
		this._frameRequester.setFrameReceiver(this._onNextFrame);
		this._frameRequester.requestNextFrame(false);
		this._ignoreRenderPhase = ignoreRenderPhase;
	}

	stop():void {
		if(!this._running) {
			return;
		}

		this._running = false;

		if(this._frameRequester) {
			this._frameRequester.setFrameReceiver(null);
			this._frameRequester.cancelRequestedFrame();
		}
	}

	pause():void {
		this._paused = true;
	}

	resume():void {
		this._paused = false;
	}

	setTimeScale(timeScale:number = 1):void {
		this._gameTime.setScale(timeScale);
	}

	add(updatable:IGameLoopUpdatable):void {
		let list = this._updatableSystems.get(updatable.updatePhase);
		if(!list) {
			list = [];
			this._updatableSystems.set(updatable.updatePhase, list);
		}
		list.push(updatable);
	}

	remove(updatable:IGameLoopUpdatable):void {
		const list = this._updatableSystems.get(updatable.updatePhase);
		if(!list) {
			return;
		}

		const index = list.lastIndexOf(updatable);
		if(index >= 0) {
			list.splice(index, 1);
		}
	}

	private _requestNextFrame():void {
		this._frameRequester?.requestNextFrame(true);
	}

	private readonly _onNextFrame = (deltaTimeMs:number):void => {
		if(!this._running) {
			return;
		}

		this._tick(deltaTimeMs);

		this._requestNextFrame();
	};

	protected _tick(deltaTime:number):void {
		//add game time
		this._gameTime.addDeltaTime(deltaTime);

		if(this._paused) {
			return;
		}

		//update systems by phases order
		for(const phase of OrderedGameLoopPhases) {
			const systems = this._updatableSystems.get(phase);
			if(systems) {
				for(const system of systems) {
					system.update?.(this._gameTime.deltaTimeMs);
				}
			}
		}

		//render graphics
		if(!this._ignoreRenderPhase) {
			this._renderMethod?.();
		}
	}

}