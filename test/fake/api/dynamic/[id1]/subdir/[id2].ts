import { IsAlpha } from "class-validator";

class Thing {
  @IsAlpha()
  t!: string;
}

export const responseShape = Thing.name;

export default () => {};
