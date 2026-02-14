/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: core-utils.ts
 * Path: assets/Script/core/
 * Author: alexeygara
 * Last modified: 2026-02-14 16:47
 */

import type { IDestroyable }       from "core_api/base-types";
import type { IGameLoopUpdatable } from "core_api/gameloop-types";
import type { AppSystem }          from "core_api/system-types";

const keys1:Record<keyof IDestroyable, true> = { destroyed: true, destroy: true };
const KEYS_1 = Object.keys(keys1);
export const isDestroyable = (instance:object):instance is IDestroyable =>
	KEYS_1.every(key => key in instance);

const keys2:Record<keyof AppSystem, true> = { name: true, paused: true, pause: true, resume: true };
const KEYS_2 = Object.keys(keys2);
export const isAppSystem = (instance:object):instance is AppSystem =>
	KEYS_2.every(key => key in instance);

const keys3:Record<keyof IGameLoopUpdatable, true> = { update: true, updatePhase: true };
const KEYS_3 = Object.keys(keys3);
export const isGameLoopActor = (instance:object):instance is IGameLoopUpdatable =>
	KEYS_3.every(key => key in instance);
