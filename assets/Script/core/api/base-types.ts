/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: base-types.ts
 * Path: assets/Script/app/core/api/base/
 * Author: alexeygara
 * Last modified: 2026-02-05 20:38
 */

export interface IDestroyable {

	readonly destroyed:boolean;

	destroy():void;
}
