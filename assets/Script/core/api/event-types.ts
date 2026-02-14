/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: event-types.ts
 * Path: assets/Script/app/core/api/event/
 * Author: alexeygara
 * Last modified: 2026-02-08 00:12
 */

export interface IEventDispatcher<TEvents> {

	on<TEventID extends keyof TEvents>(eventID:TEventID,
									   handler:EventHandler<TEvents[TEventID]>):EventHandlerDisposer;

	once<TEventID extends keyof TEvents>(eventID:TEventID,
										 handler:EventHandler<TEvents[TEventID]>):EventHandlerDisposer;

	off<TEventID extends keyof TEvents>(eventID:TEventID,
										handler:EventHandler<TEvents[TEventID]>):void;
}

export interface IEventDispatcherClearable<TEvents> extends IEventDispatcher<TEvents> {

	clear():void;
}

export interface IEventEmitter<TEvents> {

	/**
	 * Emit delayed event on start the next game-loop cycle.
	 * @param eventID Event identifier.
	 * @param payload Event payload if any.
	 * @return Return a 'utility'-promise for 'await' usage within async methods.
	 * ```typescript
	 * async function():Promise<void> {
	 * 	.....
	 * 	// await when 'utility'-promise resolved...
	 * 	await this.eventEmitter.asyncEmit(EventID.EventName);
	 * }
	 * // ...and only now after 'utility'-promise resolved the event will be emitted (on the next game-loop cycle)!
	 * ```
	 */
	emit<TEventID extends keyof TEvents>(eventID:TEventID,
										 payload:TEvents[TEventID]):Promise<void>;
}

export interface IEventImmediatelyEmitter<TEvents> {

	/**
	 * Emit event immediately on the current synchronously thread.
	 * @param eventID Event identifier.
	 * @param payload Event payload if any.
	 */
	emitImmediately<TEventID extends keyof TEvents>(eventID:TEventID,
													payload:TEvents[TEventID]):void;
}
