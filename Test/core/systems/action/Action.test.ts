/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: Action.test.ts
 * Path: Test/core/systems/action/
 * Author: alexeygara
 * Last modified: 2026-02-14 21:19
 */

// Создаем конкретную реализацию для тестов
import { Action } from "core/systems/action/Action";

class TestAction extends Action {
	progress:number = 0;
	isFinished:boolean = false;

	constructor(tag:string) {
		super(tag);
	}

	// Реализуем обязательный абстрактный метод
	protected checkIsCompleteAfterUpdate():boolean {
		return this.isFinished;
	}

	// Открываем защищенные методы для проверки вызовов
	override doUpdate = jest.fn();
	override doCancel = jest.fn();
}

describe('Action (Base Class)', () => {
	let action:TestAction;

	beforeEach(() => {
		action = new TestAction('test-id');
	});

	test('должен инициализироваться с корректным id', () => {
		expect(action.id).toBe('test-id');
		expect(action.completed).toBe(false);
		expect(action.canceled).toBe(false);
	});

	test('update() должен вызывать doUpdate и завершать экшен при выполнении условия', () => {
		action.update(100);
		expect(action.doUpdate).toHaveBeenCalledWith(100);
		expect(action.completed).toBe(false);

		action.isFinished = true;
		action.update(16);

		expect(action.completed).toBe(true);
	});

	test('cancel() должен переводить экшен в состояние canceled', () => {
		action.cancel();
		expect(action.canceled).toBe(true);
		expect(action.doCancel).toHaveBeenCalled();
	});

	test('waitFinish() должен разрешаться при завершении (completed)', async () => {
		const promise = action.waitFinish();

		// Симулируем завершение через апдейт
		action.isFinished = true;
		action.update(0);

		const result = await promise;
		expect(result).toBe('completed');
	});

	test('waitFinish() должен разрешаться при отмене (cancelled)', async () => {
		const promise = action.waitFinish();

		action.cancel();

		const result = await promise;
		expect(result).toBe('cancelled');
	});

	test('waitFinish() должен сразу возвращать результат, если экшен уже завершен', async () => {
		action.isFinished = true;
		action.update(0); // Завершаем

		const result = await action.waitFinish();
		expect(result).toBe('completed');
	});

	test('cancel(true) должен устанавливать и canceled, и completed', () => {
		action.cancel(true);
		expect(action.canceled).toBe(true);
		expect(action.completed).toBe(true);
	});
});

describe('Action Sequences (Async Flow)', () => {

	test('должен выполнять экшены строго по очереди через await', async () => {
		const step1 = new TestAction('Step 1');
		const step2 = new TestAction('Step 2');
		const log: string[] = [];

		// Имитируем логику контроллера
		const sequence = async ():Promise<void> => {
			log.push('start 1');
			const res1 = await step1.waitFinish();
			log.push(`end 1 with ${res1}`);

			log.push('start 2');
			const res2 = await step2.waitFinish();
			log.push(`end 2 with ${res2}`);
		};

		const run = sequence();

		// 1. Завершаем первый
		step1.isFinished = true;
		step1.update(0);
		await Promise.resolve(); // даем микрозадачам выполниться

		expect(log).toContain('end 1 with completed');
		expect(log).toContain('start 2');
		expect(log).not.toContain('end 2 with completed');

		// 2. Завершаем второй
		step2.isFinished = true;
		step2.update(0);
		await run; // ждем окончания всей функции

		expect(log).toEqual([
								'start 1',
								'end 1 with completed',
								'start 2',
								'end 2 with completed'
							]);
	});

	test('должен корректно обрабатывать прерывание цепочки через cancel', async () => {
		const action = new TestAction('Cancellable');
		let status: string = '';

		const run = async ():Promise<void> => {
			status = await action.waitFinish();
		};

		const p = run();
		action.cancel(); // Отменяем вручную
		await p;

		expect(status).toBe('cancelled');
		expect(action.canceled).toBe(true);
	});

	test('должен сразу возвращать cancelled, если waitFinish вызван у уже отмененного экшена (строка 71)', async () => {
		const action = new TestAction('early-cancel');

		// 1. Сначала отменяем экшен
		action.cancel();
		expect(action.canceled).toBe(true);

		// 2. Теперь вызываем waitFinish
		// Код должен зайти в if(this.canceled) { return Promise.resolve('cancelled'); }
		const result = await action.waitFinish();

		expect(result).toBe('cancelled');
	});
});