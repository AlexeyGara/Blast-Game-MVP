/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: EventBus.ts
 * Path: assets/Script/app/core/event/
 * Author: alexeygara
 * Last modified: 2026-02-08 00:11
 */

import type {
	IEventDispatcherClearable,
	IEventEmitter,
	IEventImmediatelyEmitter
}                                  from "core_api/event-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import { GameLoopPhase }           from "core/gameloop/GameLoopPhase";

export class EventBus<TEvents extends EventBase> implements IEventDispatcherClearable<TEvents>,
															IEventEmitter<TEvents>,
															IEventImmediatelyEmitter<TEvents>,
															IGameLoopUpdatable<typeof GameLoopPhase.LOGIC> {
	readonly updatePhase = GameLoopPhase.LOGIC;

	private readonly _listeners:Map<keyof TEvents, Set<EventHandler<ResolveEventPayload<TEvents>>>> = new Map();
	private readonly _queue:Array<[keyof TEvents, ResolveEventPayload<TEvents>]> = [];

	on<K extends keyof TEvents>(event:K, handler:EventHandler<TEvents[K]>):EventHandlerDisposer {
		let set = this._listeners.get(event);

		if(!set) {
			set = new Set();
			this._listeners.set(event, set);
		}

		set.add(handler);

		// event handler disposer
		return () => {
			set!.delete(handler);
			if(set!.size === 0) {
				this._listeners.delete(event);
			}
		};
	}

	once<K extends keyof TEvents>(event:K, handler:EventHandler<TEvents[K]>):EventHandlerDisposer {
		const dispose = this.on(event, payload => {
			dispose();
			handler(payload);
		});
		return dispose;
	}

	off<K extends keyof TEvents>(event:K, handler:EventHandler<TEvents[K]>):void {
		const set = this._listeners.get(event);
		if(set) {
			set.delete(handler);
			if(set.size === 0) {
				this._listeners.delete(event);
			}
		}
	}

	emitImmediately<K extends keyof TEvents>(event:K, payload:TEvents[K]):void {
		const set = this._listeners.get(event);
		if(!set) {
			return;
		}

		// use a copy of 'set' for avoid modifications while 'emit' is processing
		for(const handler of [...set]) {
			handler(payload);
		}
	}

	emit<K extends keyof TEvents>(event:K, payload:TEvents[K]):Promise<void> {
		const waiter = Promise.resolve();

		this._queue.push([event, payload]);

		return waiter;
	}

	clear():void {
		this._listeners.clear();
		this._queue.length = 0;
	}

	update():void {
		const queue = [...this._queue];

		this._queue.length = 0;

		for(const [eventId, payload] of queue) {
			this.emitImmediately(eventId, payload);
		}
	}
}