/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast_MVP_Cocos
 * File: global.d.ts
 * Path: assets/Script/
 * Author: alexeygara
 * Last modified: 2026-02-01 13:57
 */

declare type Writeable<T> = { -readonly [P in keyof T]:T[P] };

declare type DefineRequire<T> = { [P in keyof T]:T[P] | undefined; };

declare type Constructable<TClass> = new (...args:void[]) => TClass;

declare type ConstructableWithArgs<TClass, TArgs> = new (...args:TArgs) => TClass;

declare const ccMax8BitValue:number;

declare const wait:(milliSeconds:number) => Promise<void>;

declare function assertNever(value:never):never;

interface Global {

	ccMax8BitValue:typeof ccMax8BitValue;

	wait:typeof wait;

	cc:{
		assertProp:typeof cc.assertProp;
	};
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends Global {}

declare namespace cc {

	export function assertProp<TPropertyType, TOwnerType extends cc.Component>(
		thisArg:TOwnerType,
		propNameOrIsPrivate:keyof TOwnerType | true,
		altCheckMethod?:() => TPropertyType
	):TPropertyType;
}