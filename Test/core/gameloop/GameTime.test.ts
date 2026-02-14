/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: GameTime.test.ts
 * Path: Test/core/gameloop/
 * Author: alexeygara
 * Last modified: 2026-02-14 21:13
 */

import { GameTime } from "core/gameloop/GameTime";

describe('GameTime', () => {
	const MAX_THRESHOLD = 1000;

	test('должен инициализироваться с нулевыми значениями', () => {
		const gt = new GameTime();
		expect(gt.totalTimeMs).toBe(0);
		expect(gt.deltaTimeMs).toBe(0);
		expect(gt.originTotalTimeMs).toBe(0);
	});

	test('должен корректно накапливать время при обычном масштабе (scale = 1)', () => {
		const gt = new GameTime();
		gt.addDeltaTime(16);
		gt.addDeltaTime(16);

		expect(gt.deltaTimeMs).toBe(16);
		expect(gt.totalTimeMs).toBe(32);
		expect(gt.originTotalTimeMs).toBe(32);
	});

	test('должен учитывать timeScale для дельты и общего времени', () => {
		const gt = new GameTime();
		gt.setScale(0.5); // замедляем время в 2 раза

		gt.addDeltaTime(100);

		expect(gt.originDeltaTimeMs).toBe(100);
		expect(gt.deltaTimeMs).toBe(50);
		expect(gt.totalTimeMs).toBe(50);

		gt.addDeltaTime(100);
		expect(gt.totalTimeMs).toBe(100); // 50 + 50
	});

	test('должен ограничивать дельту согласно maxDeltaTimeThreshold', () => {
		const gt = new GameTime(MAX_THRESHOLD); // порог 1000мс

		gt.addDeltaTime(5000); // передаем 5 секунд (например, после лага)

		expect(gt.originDeltaTimeMs).toBe(1000); // обрезано до порога
		expect(gt.totalTimeMs).toBe(1000);
	});

	test('не должен позволять устанавливать отрицательный масштаб (scale < 0)', () => {
		const gt = new GameTime();
		gt.setScale(-5); // пытаемся установить инверсию времени

		gt.addDeltaTime(100);

		// Согласно коду: Math.max(0, timeScale)
		expect(gt.deltaTimeMs).toBe(0);
	});

	test('должен корректно работать при ускорении времени', () => {
		const gt = new GameTime();
		gt.setScale(2); // ускоряем в 2 раза

		gt.addDeltaTime(16);

		expect(gt.deltaTimeMs).toBe(32);
		expect(gt.totalTimeMs).toBe(32);
		expect(gt.originTotalTimeMs).toBe(16);
	});

	test('смена масштаба не должна влиять на уже накопленное время', () => {
		const gt = new GameTime();
		gt.addDeltaTime(100); // scale 1: total = 100

		gt.setScale(2);
		gt.addDeltaTime(100); // scale 2: delta = 200, total = 100 + 200

		expect(gt.totalTimeMs).toBe(300);
		expect(gt.originTotalTimeMs).toBe(200);
	});
});