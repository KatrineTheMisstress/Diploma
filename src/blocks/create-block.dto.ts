import { IsString, IsInt, IsObject } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  page_id: string;

  @IsString()
  type: string;

  @IsInt()
  position_x: number;

  @IsInt()
  position_y: number;

  @IsInt()
  width: number;

  @IsInt()
  height: number;

  @IsObject()
  settings: Record<string, any>;
}
