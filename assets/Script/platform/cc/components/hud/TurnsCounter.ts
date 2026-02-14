/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: TurnsCounter.ts
 * Path: assets/Script/platform/cc/components/hud/
 * Author: alexeygara
 * Last modified: 2026-02-10 07:58
 */

import ccclass = cc._decorator.ccclass;
import disallowMultiple = cc._decorator.disallowMultiple;

@ccclass
@disallowMultiple
export class TurnsCounter extends cc.Component {

	onAnimPeak?:() => void;

}