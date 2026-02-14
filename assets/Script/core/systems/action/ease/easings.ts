/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Chesstles-TS
 * File: index.ts
 * Path: src/core/systems/actions/ease/
 * Author: alexeygara
 * Last modified: 2026-01-28 17:57
 */

/**
 * Easing (in, out, or both) function.
 * @param from start (initial) value
 * @param to finish (target) value
 * @param progress current progress value of update-process, 0.0 - 1.0
 * @return calculated current value relative to '{@link progress}' and between '{@link from}' and '{@link to}' interval
 */
export type Easing = (from:number, to:number, progress:number) => number;

// t = t^2
const quadIn = (t:number):number => t * t;
// t = 1 - (1 - t)^2
const quadOut = (t:number):number => t * (2 - t);
const quadInOut = (t:number):number => t < 0.5 ?
									   2 * t * t :
									   -1 + (4 - 2 * t) * t;

// t = t^3
const cubicIn = (t:number):number => t * t * t;
// t = 1 - (1 - t)^3
const cubicOut = (t:number):number => 3 * t - 3 * t * t + t * t * t;
const cubicInOut = (t:number):number => t < 0.5 ?
										4 * t * t * t :
										4 * t * t * t - 12 * t * t + 12 * t - 3;

export const LineInOut:Easing = (from, to, progress) => from + (to - from) * progress;

/** Soft acceleration from start. */
export const QuadIn:Easing = (from, to, progress) => from + (to - from) * quadIn(progress);

/** Soft deceleration to finish. */
export const QuadOut:Easing = (from, to, progress) => from + (to - from) * quadOut(progress);

/** Soft acceleration from start and deceleration to finish. */
export const QuadInOut:Easing = (from, to, progress) => from + (to - from) * quadInOut(progress);

/** Very soft acceleration from start. */
export const CubicIn:Easing = (from, to, progress) => from + (to - from) * cubicIn(progress);

/** Very soft deceleration to finish. */
export const CubicOut:Easing = (from, to, progress) => from + (to - from) * cubicOut(progress);

export const CubicInOut:Easing = (from, to, progress) => from + (to - from) * cubicInOut(progress);