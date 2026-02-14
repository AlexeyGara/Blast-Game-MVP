const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {

  preset: 'ts-jest',

  testEnvironment: "node",

  roots: ['<rootDir>/assets/Script', '<rootDir>/Test'],

  testMatch: [
    '<rootDir>/Test/**/?(*.)+(spec|test).ts?(x)'
  ],

  moduleNameMapper: {
    //directly links
    '^@_global-init_$': '<rootDir>/assets/Script/global-init.ts',
    '^app_settings_dto$': '<rootDir>/assets/Script/app-settings.json',

    //cocos aliases
    '^@cc_editor/(.*)$': '<rootDir>/assets/Script/platform/cc/editor_only/$1',
    '^@cc_components/(.*)$': '<rootDir>/assets/Script/platform/cc/components/$1',
    '^@cc_prefabs/(.*)$': '<rootDir>/assets/Script/platform/cc/prefabs/$1',
    '^@cc_platform/(.*)$': '<rootDir>/assets/Script/platform/cc/platform/$1',

    //core
    '^core_api/(.*)$': '<rootDir>/assets/Script/core/api/$1',
    '^core/(.*)$': '<rootDir>/assets/Script/core/$1',

    //gameplay
    '^game_api/(.*)$': '<rootDir>/assets/Script/gameplay/api/$1',
    '^game/(.*)$': '<rootDir>/assets/Script/gameplay/$1',

    //app
    '^services/(.*)$': '<rootDir>/assets/Script/app/services/$1',
    '^app_api/(.*)$': '<rootDir>/assets/Script/app/api/$1',
    '^app/(.*)$': '<rootDir>/assets/Script/app/$1',
  },

  transform: {
    ...tsJestTransformCfg,
  },

};