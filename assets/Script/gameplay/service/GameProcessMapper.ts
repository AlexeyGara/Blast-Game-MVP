/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: BlastGame_MVP-Cocos
 * File: GameProcessMapper.ts
 * Path: assets/Script/gameplay/service/
 * Author: alexeygara
 * Last modified: 2026-02-11 14:41
 */

import type { GameProcessDTO } from "core_api/service-types";
import type { GameStatus }     from "game/GameStatus";
import { isBlockTypeData }     from "game/logic/blocks/BlocksField";
import type {
	GameProcessResult,
	IGameProcessResultAgent
}                              from "game_api/game-api";
import type {
	BlocksFieldData,
	BlocksFieldEditor,
	BlockType,
	Column,
	EmptySector,
	Row
}                              from "game_api/logic-api";

//TODO: implement version control
const MAPPER_VERSION = '1.0';
type SectorDTO = `${Row}-${Column}:${BlockType | EmptySector}`;
const sectorDTOParseRegExp = /^(?<Row>\d+)-(?<Column>\d+):(?<Type>.+)$/;
type DTO = {
	version:typeof MAPPER_VERSION;
	board_data:SectorDTO[];
	game_process:{
		status:number;
		total_score:number;
		score_to_win:number;
		turns_completed:number;
		turns_left:number;
		boosters_count:{
			teleport:number;
			bomb:number;
		};
	};
};

export class GameProcessMapper {

	serialize(gameField:BlocksFieldData, gameResult:GameProcessResult):GameProcessDTO {

		const dto:DTO = {
			version: MAPPER_VERSION,

			board_data: gameField.sectors.map(([row, col]) => {
				return `${row}-${col}:${gameField.getDataAt(row, col)}` as SectorDTO;
			}),

			game_process: {
				status: gameResult.status,

				total_score: gameResult.totalScore,
				score_to_win: gameResult.scoreToWin,

				turns_completed: gameResult.turnsCompleted,
				turns_left: gameResult.turnsLeft,

				boosters_count: {
					teleport: gameResult.boosters.teleport,
					bomb: gameResult.boosters.bomb
				}
			}
		};

		return JSON.stringify(dto);
	}

	deserialize(gameProcessDTO:DTO | string,
				targetGameField:BlocksFieldEditor, targetGameProcess:IGameProcessResultAgent):void {

		if(typeof gameProcessDTO === 'string') {
			gameProcessDTO = JSON.parse(gameProcessDTO) as DTO;
		}

		this._getDeserializer(gameProcessDTO.version)(
			gameProcessDTO,
			targetGameField, targetGameProcess
		);
	}

	private _getDeserializer(version:string):(gameProcessDTO:DTO,
											  targetGameField:BlocksFieldEditor,
											  targetGameProcess:IGameProcessResultAgent) => void {
		console.log(version);
		return (gameProcessDTO:DTO,
				targetGameField:BlocksFieldEditor, targetGameProcess:IGameProcessResultAgent) => {

			targetGameField.clear();

			for(const sectorDTO of gameProcessDTO.board_data) {
				const match = sectorDTO.match(sectorDTOParseRegExp);
				if(match) {
					// match[1] — (\d+) -> Row
					// match[2] — (\d+) -> Column
					// match[3] — (.+)  -> Type
					const row = parseInt(match[1], 10);
					const column = parseInt(match[2], 10);
					const sectorData = parseInt(match[3], 10) as BlockType | EmptySector;

					if(isBlockTypeData(sectorData)) {
						targetGameField.setDataAt(row, column, sectorData);
					}
				}
			}

			//TODO: implement parsing to a game process result
			targetGameProcess.setStatus(gameProcessDTO.game_process.status as GameStatus);
		};
	}

}