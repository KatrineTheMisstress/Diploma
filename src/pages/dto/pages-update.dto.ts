import { IsJSON, IsString } from 'class-validator';

export class PageUpdateDTO {
  @IsString()
  pageId: string;

  data: object;
}
