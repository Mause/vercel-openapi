import {IsString} from "class-validator";
import {VercelRequest, VercelResponse} from "@vercel/node";

export const methods = new Set(["POST", "GET"]);

class PostRequest {
  @IsString()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
class PostResponse extends PostRequest {
  @IsString()
  id: string;

  constructor(id: string, name: string) {
    super(name);
    this.id = id;
  }
}

export const requestShape = PostRequest.name;
export const responseShape = PostResponse.name;
export const tags = ["create"];

export default (_res: VercelRequest, _request: VercelResponse) => {};
