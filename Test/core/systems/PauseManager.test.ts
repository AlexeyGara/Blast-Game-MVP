/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: PauseManager.test.ts
 * Path: Test/core/systems/
 * Author: alexeygara
 * Last modified: 2026-02-15 09:35
 */

import { PauseManager } from "core/systems/PauseManager";
import type {
	AppSystem,
	IPauseManager
}                       from "core_api/system-types";

class MockSystem implements AppSystem {
	name = 'MockSystem';
	paused = false;
	pause = jest.fn(() => {
		this.paused = true;
	});
	resume = jest.fn(() => {
		this.paused = false;
	});
}

describe('PauseManager (Updated)', () => {
	let manager:PauseManager;
	let mockSystem:MockSystem;
	let masterProxy:IPauseManager & {
		capturedProxy?:AppSystem;
	};

	beforeEach(() => {
		mockSystem = new MockSystem();
		// Мокаем мастера, чтобы перехватить Proxy, который создает PauseManager
		masterProxy = {
			name: 'MasterProxy',
			pause: ():void => {
			},
			resume: ():void => {
			},
			paused: false,
			addSystem: jest.fn((proxy) => {
				masterProxy.capturedProxy = proxy; // Сохраняем прокси для тестов
				return jest.fn(); // Возвращаем функцию отписки
			}),
			removeSystem: jest.fn()
		};
		manager = new PauseManager('Child', masterProxy);
	});

	test('должен возвращать функцию-отписчик при addSystem', () => {
		const unsubscribe = manager.addSystem(mockSystem);
		expect(typeof unsubscribe).toBe('function');

		unsubscribe(true); // Удаляем и ставим на паузу
		expect(mockSystem.pause).toHaveBeenCalled();
		//@ts-expect-error private access
		expect((manager)._systems.has(mockSystem)).toBe(false);
	});

	test('Proxy: должен реагировать на паузу мастера через прокси-объект', () => {
		manager.addSystem(mockSystem);

		// Эмулируем вызов паузы от мастер-менеджера через прокси
		masterProxy.capturedProxy!.pause();

		expect(mockSystem.pause).toHaveBeenCalled();
	});

	test('Proxy: должен реагировать на возобновление мастера через прокси-объект', () => {
		manager.addSystem(mockSystem);
		manager.pause(); // Ставим локальную паузу
		jest.clearAllMocks();

		masterProxy.capturedProxy!.resume();

		// Если локальная пауза активна (_paused = true), resume прокси не должен будить системы
		expect(mockSystem.resume).not.toHaveBeenCalled();

		manager.resume(); // Снимаем локальную
		masterProxy.capturedProxy!.resume(); // Теперь мастер будит
		expect(mockSystem.resume).toHaveBeenCalled();
	});

	test('pause(): не должен срабатывать повторно, если уже на паузе', () => {
		manager.addSystem(mockSystem);
		manager.pause();
		manager.pause(); // Повторный вызов (строка 93: if (this._paused) return)

		expect(mockSystem.pause).toHaveBeenCalledTimes(1);
	});

	test('resume(): не должен срабатывать, если не был на паузе', () => {
		manager.addSystem(mockSystem);
		manager.resume(); // Строка 104: if (!this._paused) return

		expect(mockSystem.resume).not.toHaveBeenCalled();
	});

	test('destroy(): должен вызывать функцию отписки от мастера', () => {
		//@ts-expect-error private access
		const disposer = (manager)._removeFromMaster;
		const spyDisposer = jest.fn(disposer);
		//@ts-expect-error private access
		(manager)._removeFromMaster = spyDisposer;

		manager.destroy();

		expect(spyDisposer).toHaveBeenCalled();
		expect(manager.destroyed).toBe(true);
	});

	test('addSystem(): должен возвращать пустую функцию, если менеджер уничтожен', () => {
		manager.destroy();
		const result = manager.addSystem(mockSystem);

		expect(typeof result).toBe('function');
		result(true); // Вызов не должен упасть или что-то сделать
		expect(mockSystem.pause).not.toHaveBeenCalled();
	});

	test('addSystem: должен синхронизировать в обе стороны', () => {
		const sys1 = new MockSystem();
		const sys2 = new MockSystem();

		// Случай 1: Менеджер на паузе, система НЕТ -> должна встать на паузу
		manager.pause();
		sys1.paused = false;
		manager.addSystem(sys1);
		expect(sys1.pause).toHaveBeenCalled();

		// Случай 2: Менеджер НЕ на паузе, система НА паузе -> должна проснуться
		manager.resume();
		sys2.paused = true;
		manager.addSystem(sys2);
		expect(sys2.resume).toHaveBeenCalled();
	});

	test('removeSystem: должен возвращать false, если менеджер уничтожен', () => {
		manager.destroy();
		const result = manager.removeSystem(mockSystem);

		expect(result).toBe(false);
		expect(mockSystem.pause).not.toHaveBeenCalled();
	});

	test('removeSystem: должен снимать систему с паузы при удалении, если передан false', () => {
		manager.addSystem(mockSystem);

		// Вызываем с параметром false
		const result = manager.removeSystem(mockSystem, false);

		expect(result).toBe(true);
		expect(mockSystem.resume).toHaveBeenCalled();
	});
});