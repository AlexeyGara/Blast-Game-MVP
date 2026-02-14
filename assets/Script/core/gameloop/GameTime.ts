import type {
	GameTime as GameTimeType,
	IGameTimeAgent,
	IScaledGameTime
} from "core_api/gameloop-types";

export class GameTime implements GameTimeType,
								 IScaledGameTime,
								 IGameTimeAgent {
	private _elapsedTime:number = 0;
	private _scaledElapsedTime:number = 0;
	private _lastDeltaTime:number = 0;
	private _scaledLastDeltaTime:number = 0;
	private _timeScale:number = 1;
	private readonly _maxDeltaTimeThreshold:number = 0;

	constructor(maxDeltaTimeThreshold:number = 0) {
		this._maxDeltaTimeThreshold = maxDeltaTimeThreshold > 0 ? maxDeltaTimeThreshold : 0;
	}

	/**
	 * Scaled total time, ms
	 */
	get totalTimeMs():number {
		return this._scaledElapsedTime;
	}

	/**
	 * Native total time, ms
	 */
	get originTotalTimeMs():number {
		return this._elapsedTime;
	}

	/**
	 * Scaled delta time, ms
	 */
	get deltaTimeMs():number {
		return this._scaledLastDeltaTime;
	}

	/**
	 * Native delta time, ms
	 */
	get originDeltaTimeMs():number {
		return this._lastDeltaTime;
	}

	setScale(timeScale:number = 1):void {
		this._timeScale = Math.max(0, timeScale);
	}

	addDeltaTime(dt:number):void {
		this._lastDeltaTime = this._maxDeltaTimeThreshold > 0 ? Math.min(dt, this._maxDeltaTimeThreshold) : dt;
		this._elapsedTime += this._lastDeltaTime;

		this._scaledLastDeltaTime = this._lastDeltaTime * this._timeScale;
		this._scaledElapsedTime += this._scaledLastDeltaTime;
	}
}