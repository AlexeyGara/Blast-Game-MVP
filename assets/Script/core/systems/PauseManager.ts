/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: PauseManager.ts
 * Path: assets/Script/app/core/systems/
 * Author: alexeygara
 * Last modified: 2026-02-12 08:17
 */

import type { IDestroyable } from "core_api/base-types";
import type {
	AppSystem,
	IPauseManager
}                            from "core_api/system-types";

export class PauseManager implements IPauseManager,
									 IDestroyable {

	readonly name:string;

	get paused():boolean {
		return this._paused || !!this._masterManager?.paused;
	}

	private _paused:boolean = false;

	readonly destroyed:boolean = false;

	private readonly _systems:Set<AppSystem> = new Set();
	private readonly _masterManager?:IPauseManager;
	private readonly _removeFromMaster?:() => void;

	constructor(
		name:string,
		masterManager?:IPauseManager
	) {
		this.name = name;
		this._masterManager = masterManager;
		this._removeFromMaster = this._masterManager?.addSystem(
			{
				name: `${this.name}:Proxy`,
				paused: this._masterManager!.paused,
				pause: ():void => {
					if(!this._paused) {
						this._doPause();
					}
				},
				resume: ():void => {
					if(!this._paused) {
						this.resume();
					}
				}
			}
		);
	}

	addSystem(system:AppSystem):(changePauseStateTo?:boolean) => void {
		if(this.destroyed) {
			return () => void 0;
		}

		this._systems.add(system);

		if(this.paused != system.paused) {
			if(this.paused) {
				system.pause();
			}
			else {
				system.resume();
			}
		}

		return (changePauseStateTo?:boolean) => {
			this.removeSystem(system, changePauseStateTo);
		};
	}

	removeSystem(system:AppSystem, changePauseStateTo?:boolean):boolean {
		if(this.destroyed) {
			return false;
		}

		if(!this._systems.delete(system)) {
			return false;
		}

		if(changePauseStateTo === true) {
			system.pause();
		}
		else if(changePauseStateTo === false) {
			system.resume();
		}

		return true;
	}

	pause():void {
		if(this.destroyed || this._paused) {
			return;
		}

		this._paused = true;

		this._doPause();
	}

	resume():void {
		if(this.destroyed || !this._paused) {
			return;
		}

		this._paused = false;

		for(const system of this._systems) {
			system.resume();
		}
	}

	destroy():void {
		this._systems.clear();
		this._removeFromMaster?.();

		(this.destroyed as Writeable<boolean>) = true;
	}

	private _doPause():void {
		for(const system of this._systems) {
			system.pause();
		}
	}

}