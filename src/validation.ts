import { OpenApiBuilder } from "openapi3-ts";

export function validateDoc(doc: OpenApiBuilder) {
  const result = doc.getSpec();

  for (const operation of Object.values(result.paths)) {
    validateRefs(operation, result);
  }
}

function validateRefs(operation: any, result: OpenApiBuilder["rootDoc"]) {
  if (Array.isArray(operation)) {
    for (const item of operation) {
      validateRefs(item, result);
    }
  } else if (operation !== null && typeof operation === "object") {
    if (operation.$ref) {
      const parts = operation.$ref.split("/");
      const ref = parts[parts.length - 1];
      if (!result.components!.schemas![ref]) {
        throw new Error(`Couldn't find ${operation.$ref}`);
      } else if (ref === "Array" || ref === "Object") {
        throw new Error(`Invalid ref in ${operation.operationId}`);
      }
    }
    for (const sub of Object.values(operation)) {
      validateRefs(sub, result);
    }
  }
}
