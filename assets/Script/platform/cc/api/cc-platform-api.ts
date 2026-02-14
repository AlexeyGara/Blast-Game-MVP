/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: cc-platform-api.ts
 * Path: assets/Script/platform/cc/api/
 * Author: alexeygara
 * Last modified: 2026-02-15 16:39
 */

import type { AnimationStarter } from "core_api/animation-types";

export type IUsedAnimations = {

	getAnimationStarter(ccAnim:cc.Animation):AnimationStarter;
}