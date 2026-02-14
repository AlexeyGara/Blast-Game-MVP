/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: global-init.ts
 * Path: assets/Script/
 * Author: alexeygara
 * Last modified: 2026-02-08 04:26
 */

//TODO: move to env

// ---- GLOBAL VARS --->

console.info(`!!GLOBAL INITIALIZED!!`);

// @ts-expect-error it's ok
const _global:Global = (// eslint-disable-line @typescript-eslint/naming-convention
	global/* node <- "moduleResolution":"node" */
	||
	window/* browser <- "moduleResolution":"classic" */
);

_global.ccMax8BitValue = (1 << 8) - 1;

_global.wait ||= function wait(timeMs:number):Promise<void> {
	return new Promise(resolve => setTimeout(resolve, timeMs));
};

_global.cc = _global.cc || {};
_global.cc.assertProp ||= function <TPropertyType, TOwnerType extends cc.Component>(thisArg:TOwnerType,
																					propNameOrIsPrivate:keyof TOwnerType | true,
																					altCheckMethod?:() => TPropertyType):TPropertyType {
	//void Promise.resolve().then(() => {
	void new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
		let prop;
		let message;
		if(propNameOrIsPrivate === true) {
			prop = altCheckMethod?.();
			message
				= `[cc.assertProp] Some private/protected property is missing on component named '${thisArg.name}'!`;
		}
		else {
			prop = (thisArg as never)[propNameOrIsPrivate];
			message = `[cc.assertProp] Property "${String(
				propNameOrIsPrivate)}" is missing on component named '${thisArg.name}'!`;
		}
		if(prop === undefined || prop === null) {
			//throw new Error(message);
			console.error(message);
		}
	});
	return null as TPropertyType;
};

// <--- GLOBAL VARS ----

export const assertProp = _global.cc.assertProp;