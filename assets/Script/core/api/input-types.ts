/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: input-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-12 04:43
 */

export type HaveInteraction = {

	readonly interactive:boolean;

	enableInteraction():void;

	disableInteraction():void;
}