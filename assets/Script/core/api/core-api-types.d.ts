/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: core-api-types.d.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-11 17:11
 */

declare type AssetUniqueAlias = string;

declare type CanBeUpdate = {
	update?(deltaTimeMs:number):void;
}

declare type OnFinishResult = "completed" | "cancelled";

declare type FinishAwait = {
	waitFinish():Promise<OnFinishResult>;
}


type EventPayloadData = undefined | string | number | boolean | Error;

declare type EventPayloadBase = Record<string, EventPayloadData | EventPayloadBase>;

declare type EventIdBase = string;

declare type EventBase = Record<EventIdBase, void | EventPayloadData | EventPayloadBase>;

declare type EventHandler<T> = (payload:T) => void;

declare type ResolveEventPayload<TEvents extends Record<string, EventPayloadBase>>
	= TEvents extends Record<string, infer TPayload> ? TPayload : never;

declare type EventHandlerDisposer = () => void;
