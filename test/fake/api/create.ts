import { IsString, ValidateNested } from "class-validator";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { Endpoint } from "./../../../src";
import { Type } from "class-transformer";

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
  @IsString({ each: true })
  names: string[];
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[];

  constructor(id: string, name: string, names: string[], items: Item[]) {
    super(name);
    this.id = id;
    this.names = names;
    this.items = items;
  }
}
class Item {
  @IsString()
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export const openapiMetadata: Endpoint = {
  methods: ["post", "get"],
  requestShape: PostRequest.name,
  responseShape: PostResponse.name,
  tags: ["create"],
};

export default (_res: VercelRequest, _req: VercelResponse) => {};
