import { IsString } from "class-validator";
import { VercelRequest, VercelResponse } from "@vercel/node";

class GetRequest {
  @IsString()
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
export const responseShape = GetRequest.name;

export default (_res: VercelRequest, _req: VercelResponse) => {};
