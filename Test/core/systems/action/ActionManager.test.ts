/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: ActionManager.ts
 * Path: Test/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-14 21:59
 */

import { GameLoopPhase } from "core/gameloop/GameLoopPhase";
import { ActionManager } from "core/systems/action/ActionManager";

class MockAction {
	id:string;
	completed = false;
	canceled = false;
	update = jest.fn();
	cancel = jest.fn(() => {
		this.canceled = true;
	});

	constructor(tag:string = "") {
		this.id = tag;
	}

	finish():void {
		this.completed = true;
	}

	readonly progress:number = 0;
}

describe('ActionManager', () => {
	let manager:ActionManager;

	beforeEach(() => {
		manager = new ActionManager('TestManager');
	});

	test('должен инициализироваться с правильным именем и фазой', () => {
		expect(manager.name).toBe('TestManager');
		expect(manager.updatePhase).toBe(GameLoopPhase.LOGIC);
	});

	test('должен запускать экшен и возвращать Promise', async () => {
		const action = new MockAction();
		const promise = manager.start(action);

		expect(promise).toBeInstanceOf(Promise);

		action.finish();
		manager.update(16);

		const result = await promise;
		expect(result).toBe('completed');
	});

	test('при повторном старте того же экшена должен возвращать тот же Promise', () => {
		const action = new MockAction();
		const p1 = manager.start(action);
		const p2 = manager.start(action);

		expect(p1).toBe(p2);
	});

	test('должен обновлять активные экшены в update()', () => {
		const action = new MockAction();
		void manager.start(action);

		manager.update(100);

		expect(action.update).toHaveBeenCalledWith(100);
	});

	test('не должен обновлять экшены, если менеджер на паузе', () => {
		const action = new MockAction();
		void manager.start(action);
		manager.pause();

		manager.update(100);

		expect(action.update).not.toHaveBeenCalled();
		expect(manager.paused).toBe(true);
	});

	test('cancelAllByTag должен отменять только экшены с конкретным тегом', async () => {
		const act1 = new MockAction('tag1');
		const act2 = new MockAction('tag2');

		const p1 = manager.start(act1);
		const p2 = manager.start(act2);

		manager.cancelAllByTag('tag1');

		manager.cancelAllByTag('tag1');

		// 1. Проверяем, что первый отменился
		expect(act1.cancel).toHaveBeenCalled();
		await expect(p1).resolves.toBe('cancelled');

		// 2. Проверяем, что второй всё еще активен (не отменен)
		expect(act2.cancel).not.toHaveBeenCalled();

		// 3. Завершаем второй экшен вручную, чтобы убедиться, что он живой
		act2.finish();
		manager.update(0);
		await expect(p2).resolves.toBe('completed');
	});

	test('cancelAll должен очищать все активные экшены', async () => {
		const act1 = new MockAction();
		const act2 = new MockAction();
		void manager.start(act1);
		void manager.start(act2);

		manager.cancelAll();

		expect(act1.cancel).toHaveBeenCalled();
		expect(act2.cancel).toHaveBeenCalled();
	});

	test('должен удалять экшен из списков после завершения', () => {
		const action = new MockAction();
		void manager.start(action);

		action.finish();
		manager.update(0);

		// Проверяем через повторный старт (должен создаться новый промис, а не старый)
		const p2 = manager.start(action);
		// @ts-expect-error trust me
		const actCallbacks = (manager)._activeCallbacks.get(action);
		expect(p2).toBe(actCallbacks!.resolver);
	});

	test('pause call', () => {
		manager.pause();
		expect(manager.paused).toBe(true);

		manager.resume(); // Вот вызов строки 79
		expect(manager.paused).toBe(false);
	});

	test('должен завершать экшен, если он выполнился в процессе update (строка 115)', async () => {
		const action = new MockAction();
		const promise = manager.start(action);

		// Подменяем update так, чтобы он сам завершал экшен
		action.update.mockImplementation(() => {
			action.completed = true;
		});

		// Вызываем апдейт менеджера
		manager.update(16);

		// (this._resolveAndClear(act)) должна быть пройдена
		await expect(promise).resolves.toBe('completed');
		// @ts-expect-error private access
		expect((manager)._active.has(action)).toBe(false);
	});
});