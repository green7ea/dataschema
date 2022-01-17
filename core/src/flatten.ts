import _ from "lodash";

import {
  ds_Definition,
  ds_Object,
  ds_Schema,
} from "./generated_types";

export function flatten_object(
  obj: ds_Object,
  def: ds_Definition,
  visited: string[] = []
): ds_Object {
  const extended_props = _(obj.extends)
    .map((extend) => def.definitions?.get(extend))
    .filter((o) => o?.type === "object")
    .filter((x) => !!x)
    .map((o) => flatten_object(o as ds_Object, def))
    .map((o) => o as ds_Object)
    .flatMap((o) => Array.from(o.properties.entries()))
    .value();

  const flat_props: [string, ds_Schema][] = _(obj.properties)
    .toPairs()
    .map(
      ([name, value]) =>
        [name, flatten_schema(value, def, visited)] as [string, ds_Schema]
    )
    .value();

  return {
    ..._.omit(obj, "extends"),
    properties: new Map([...flat_props, ...extended_props]),
  };
}

export function flatten_schema(
  schema: ds_Schema,
  def: ds_Definition,
  visited: string[] = []
): ds_Schema {
  switch (schema.type) {
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "enum":
      return schema;
    case "map":
      return {
        ...schema,
        key: flatten_schema(schema.key, def),
        value: flatten_schema(schema.value, def),
      };
    case "array":
      return {
        ...schema,
        items: flatten_schema(schema.items, def),
      };
    case "object":
      return {
        type: "object",
        ...flatten_object(schema, def),
      };
    case "oneOf":
      const options = _(Array.from(schema.these.entries()))
        .map(([name, value]) => [name, flatten_schema(value, def)])
        .value() as [string, ds_Schema][];

      return {
        ...schema,
        these: new Map(options),
      };
    case "oneOfType":
      return schema;
    case "ref":
      if (_.includes(visited, schema.to)) {
        return schema;
      }

      const ref = def.definitions?.get(schema.to);
      if (!ref) {
        throw "uh oh";
      }

      return flatten_schema(ref, def, [...visited, schema.to]);
  }
}
