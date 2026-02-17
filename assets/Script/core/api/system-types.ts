/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: system-types.ts
 * Path: assets/Script/app/core/api/
 * Author: alexeygara
 * Last modified: 2026-02-12 07:05
 */

import type { IActionManager }    from "core_api/action-types";
import type { IAnimationManager } from "core_api/animation-types";
import type {
	IMusicManager,
	ISoundManager
}                                 from "core_api/audio-types";

export type AppSystem =
	CanBePaused & {

	readonly name:string;
}

export type CanBePaused = {

	readonly paused:boolean;

	pause():void;

	resume():void;
}

type PauseSystemRemover = (changePauseStateTo?:boolean) => void;

export interface IPauseManager extends AppSystem {

	addSystem(system:AppSystem):PauseSystemRemover;

	removeSystem(system:AppSystem):boolean;
}

type ReleaseSystemCallback = () => void;

export type SystemsProvider = {

	pauseManager:{
		/**
		 * Provide an instance of pause manager.
		 * @param setName Naming identifier for created instance.
		 * @param masterPauseManager Specify a master pause manager. Will be used a global pause manager if not set.
		 * @return Release callback.
		 */
		provide:(setName:string, masterPauseManager?:IPauseManager) => [IPauseManager, ReleaseSystemCallback];
	};

	actionsManager:{
		/**
		 * Provide an instance of actions manager.
		 * @param setName Naming identifier for created instance.
		 * @param pauseManager Specify a custom pause manager. Will be used a global pause manager if not set.
		 * @return Release callback.
		 */
		provide:(setName:string, pauseManager?:IPauseManager) => [IActionManager, ReleaseSystemCallback];
	};

	animationsManager:{
		provide:(setName:string, pauseManager?:IPauseManager) => [IAnimationManager, ReleaseSystemCallback];
	};

	soundsManager:{
		provide:(setName:string, pauseManager?:IPauseManager) => [ISoundManager, ReleaseSystemCallback];
	};

	musicManager:{
		provide:() => IMusicManager;
	};
}