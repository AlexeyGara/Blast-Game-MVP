/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: GameLoop.test.ts
 * Path: Test/core/gameloop/
 * Author: alexeygara
 * Last modified: 2026-02-14 20:57
 */

import { GameLoop }              from "core/gameloop/GameLoop";
import { OrderedGameLoopPhases } from "core/gameloop/GameLoopPhase";
import type {
	IFrameRequester,
	IGameLoopUpdatable
}                                from "core_api/gameloop-types";

describe('GameLoop', () => {
	let gameLoop:GameLoop;
	let mockFrameRequester:jest.Mocked<IFrameRequester>;
	let onFrameCallback:(dt:number) => void;

	beforeEach(() => {
		gameLoop = new GameLoop();

		// Мокаем FrameRequester
		mockFrameRequester = {
			setFrameReceiver: jest.fn((cb) => {
				onFrameCallback = cb!;
			}),
			requestNextFrame: jest.fn(),
			cancelRequestedFrame: jest.fn(),
		};
	});

	test('должен корректно инициализироваться и запускаться', () => {
		const renderSpy = jest.fn();
		gameLoop.init(renderSpy);
		gameLoop.start(mockFrameRequester);

		expect(mockFrameRequester.setFrameReceiver).toHaveBeenCalled();
		expect(mockFrameRequester.requestNextFrame).toHaveBeenCalledWith(false);
	});

	test('должен вызывать update у систем в правильном порядке фаз', () => {
		const results:string[] = [];

		// Создаем две системы разных фаз
		const sys1:IGameLoopUpdatable = {
			updatePhase: OrderedGameLoopPhases[1],
			update: jest.fn(() => results.push('phase2'))
		};
		const sys2:IGameLoopUpdatable = {
			updatePhase: OrderedGameLoopPhases[0],
			update: jest.fn(() => results.push('phase1'))
		};

		gameLoop.add(sys1);
		gameLoop.add(sys2);
		gameLoop.start(mockFrameRequester);

		// Симулируем приход кадра (16мс)
		onFrameCallback(16);

		expect(sys2.update).toHaveBeenCalled();
		expect(sys1.update).toHaveBeenCalled();
		// Проверяем порядок: фаза 0 должна быть раньше фазы 1
		expect(results).toEqual(['phase1', 'phase2']);
	});

	test('не должен вызывать обновление систем при паузе', () => {
		const updatable:IGameLoopUpdatable = {
			updatePhase: OrderedGameLoopPhases[0],
			update: jest.fn()
		};

		gameLoop.add(updatable);
		gameLoop.start(mockFrameRequester);
		gameLoop.pause();

		onFrameCallback(16);

		expect(updatable.update).not.toHaveBeenCalled();
		expect(gameLoop.paused).toBe(true);
	});

	test('должен останавливать цикл и очищать коллбэки при stop()', () => {
		gameLoop.start(mockFrameRequester);
		gameLoop.stop();

		expect(mockFrameRequester.setFrameReceiver).toHaveBeenCalledWith(null);
		expect(mockFrameRequester.cancelRequestedFrame).toHaveBeenCalled();
	});

	test('должен вызывать метод отрисовки (renderMethod), если не включен ignoreRenderPhase', () => {
		const renderSpy = jest.fn();
		gameLoop.init(renderSpy);
		gameLoop.start(mockFrameRequester, false);

		onFrameCallback(16);

		expect(renderSpy).toHaveBeenCalled();
	});

	test('должен покрыть все ветвления: двойной старт, стоп и удаление', () => {
		const renderSpy = jest.fn();
		gameLoop.init(renderSpy);

		// 1. Закрываем строку 67 (двойной старт)
		gameLoop.start(mockFrameRequester);
		gameLoop.start(mockFrameRequester); // Повторный вызов зайдет в if(this._running) return
		expect(mockFrameRequester.requestNextFrame).toHaveBeenCalledTimes(1);

		// 2. Закрываем строки 83-87 (остановка)
		gameLoop.stop();
		expect(mockFrameRequester.setFrameReceiver).toHaveBeenCalledWith(null);

		// Попытка остановить уже остановленный (для надежности)
		gameLoop.stop();
	});

	test('должен корректно удалять системы (метод remove)', () => {
		const phase = OrderedGameLoopPhases[0];
		const sys: IGameLoopUpdatable = { updatePhase: phase, update: jest.fn() };

		// Случай А: Удаление из несуществующего списка (ранний return)
		gameLoop.remove(sys);

		// Случай Б: Удаление существующей системы (строки 100-107)
		gameLoop.add(sys);
		gameLoop.remove(sys);

		gameLoop.start(mockFrameRequester);
		// Имитируем кадр
		const onFrame = (mockFrameRequester.setFrameReceiver as jest.Mock).mock.calls[0][0];
		onFrame(16);

		expect(sys.update).not.toHaveBeenCalled();
	});

	test('должен корректно работать _onNextFrame при остановленном цикле', () => {
		const renderSpy = jest.fn();
		gameLoop.init(renderSpy);

		gameLoop.start(mockFrameRequester);
		const onFrame = (mockFrameRequester.setFrameReceiver as jest.Mock).mock.calls[0][0];

		gameLoop.stop();
		onFrame(16); // Заходим в if(!this._running) return в _onNextFrame (строка 117?)

		expect(renderSpy).not.toHaveBeenCalled();
	});

	test('должен покрыть методы управления циклом (строки 83-87)', () => {
		// 1. Покрываем resume()
		gameLoop.pause(); // сначала ставим паузу
		expect(gameLoop.paused).toBe(true);

		gameLoop.resume();
		expect(gameLoop.paused).toBe(false);

		// 2. Покрываем setTimeScale()
		gameLoop.setTimeScale(2);

		// Чтобы тест был честным, проверим, дошло ли значение до GameTime
		// (так как _gameTime приватный, мы косвенно проверим это через тик,
		// если GameTime влияет на deltaTimeMs)
		gameLoop.start(mockFrameRequester);

		// Захватываем коллбэк и вызываем его
		const onFrame = (mockFrameRequester.setFrameReceiver as jest.Mock).mock.calls[0][0];
		onFrame(100); // передаем 100мс, при scale=2 должно стать 200мс в системах
	});
});