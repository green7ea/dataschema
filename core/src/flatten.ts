import _ from "lodash";

import { ds_Definition, ds_Object, ds_Schema } from "./generated_types";

export function flatten_object(
  obj: ds_Object,
  def: ds_Definition,
  visited: string[] = []
): ds_Object {
  const extended_props = _(obj.extends)
    .map((extend) => {
      const obj = def.definitions?.get(extend);
      if (!obj) {
        return undefined;
      }

      const [typ, value] = obj;
      return typ === "object" ? (value as ds_Object) : undefined;
    })
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
  const [schema_type, schema_value] = schema;

  switch (schema_type) {
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "enum":
      return schema;
    case "map":
      return [
        "map",
        {
          ...schema_value,
          key: flatten_schema(schema_value.key, def),
          value: flatten_schema(schema_value.value, def),
        },
      ];
    case "array":
      return [
        "array",
        {
          ...schema,
          items: flatten_schema(schema_value.items, def),
        },
      ];
    case "tuple":
      return [
        "tuple",
        {
          ...schema,
          items: _.map(schema_value.items, (item) => flatten_schema(item, def)),
        },
      ];
    case "object":
      return [
        "object",
        {
          ...flatten_object(schema_value, def),
        },
      ];
    case "oneOf":
      const options = _(Array.from(schema_value.these.entries()))
        .map(([name, value]) => [name, flatten_schema(value, def)])
        .value() as [string, ds_Schema][];

      return [
        "oneOf",
        {
          ...schema_value,
          these: new Map(options),
        },
      ];
    case "ref":
      if (_.includes(visited, schema_value)) {
        return schema;
      }

      const ref = def.definitions?.get(schema_value);
      if (!ref) {
        throw "uh oh";
      }

      return flatten_schema(ref, def, [...visited, schema_value]);
  }
}
