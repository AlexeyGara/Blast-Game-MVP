/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: Animation.test.ts
 * Path: Test/core/systems/animation/
 * Author: alexeygara
 * Last modified: 2026-02-15 13:49
 */

import { Animation } from "core/systems/animation/Animation";

// Тестовый наследник для работы с абстрактным классом
class TestAnimation extends Animation {
	progressValue:number = 0;

	get progress():number {
		return this.progressValue;
	}

	constructor(id:string) {
		super(id);
	}

	// Делаем защищенные методы публичными для шпионажа
	override doUpdate = jest.fn();
	override doCancel = jest.fn();
	override doPause = jest.fn();
	override doResume = jest.fn();

	protected checkFinished():boolean {
		return false;
	}
}

describe.skip('Animation (Base Class)', () => {
	let anim:TestAnimation;

	beforeEach(() => {
		// По умолчанию в коде: paused: boolean = true (изначально на паузе)
		anim = new TestAnimation('anim-tag');
	});

	test('должен инициализироваться в состоянии паузы', () => {
		expect(anim.tag).toBe('anim-tag');
		expect(anim.paused).toBe(true);
		expect(anim.finished).toBe(false);
	});

	test('resume() должен снимать с паузы, если анимация не завершена', () => {
		anim.resume();
		expect(anim.paused).toBe(false);
		expect(anim.doResume).toHaveBeenCalled();
	});

	test('pause() должен ставить на паузу только активную анимацию', () => {
		anim.resume(); // Сначала запускаем
		anim.pause();  // Теперь ставим на паузу

		expect(anim.paused).toBe(true);
		expect(anim.doPause).toHaveBeenCalled();

		// Повторный вызов pause() не должен триггерить doPause
		anim.pause();
		expect(anim.doPause).toHaveBeenCalledTimes(1);
	});

	test('update() должен вызывать doUpdate, если анимация не завершена', () => {
		anim.update(100);
		expect(anim.doUpdate).toHaveBeenCalledWith(100);
	});

	test('не должен менять состояние паузы, если анимация уже finished или canceled', () => {
		// Завершаем вручную через хак Writeable (имитируем логику наследника)
		(anim.finished as Writeable<boolean>) = true;

		anim.resume();
		expect(anim.paused).toBe(true); // Осталась true (начальное значение)
		expect(anim.doResume).not.toHaveBeenCalled();
	});

	test('cancel() должен переводить в canceled и вызывать doCancel', () => {
		anim.cancel();
		expect(anim.canceled).toBe(true);
		expect(anim.doCancel).toHaveBeenCalled();
	});

	test('cancel(true) должен переводить и в canceled, и в finished', () => {
		anim.cancel(true);
		expect(anim.canceled).toBe(true);
		expect(anim.finished).toBe(true);
	});

	test('update() не должен работать после отмены или завершения', () => {
		anim.cancel();
		anim.update(16);
		expect(anim.doUpdate).not.toHaveBeenCalled();
	});
});