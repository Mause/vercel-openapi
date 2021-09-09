import { IsString } from "class-validator";

class Shape {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export const responseShape = Shape.name;

export default () => {};
