import {OpenApiBuilder} from "openapi3-ts";

export function validateDoc(document: OpenApiBuilder) {
  const result = document.getSpec();

  for (const operation of Object.values(result.paths)) {
    validateReferences(operation, result);
  }
}

function validateReferences(operation: any, result: OpenApiBuilder["rootDoc"]) {
  if (Array.isArray(operation)) {
    for (const item of operation) {
      validateReferences(item, result);
    }
  } else if (operation !== null && typeof operation === "object") {
    if (operation.$ref) {
      const parts = operation.$ref.split("/");
      const reference = parts[parts.length - 1];
      if (!result.components!.schemas![reference]) {
        throw new Error(`Couldn't find ${operation.$ref}`);
      }
    }
    for (const sub of Object.values(operation)) {
      validateReferences(sub, result);
    }
  }
}
