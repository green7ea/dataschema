import _ from "lodash";

import { ds_Definition, ds_Schema } from "./generated_types";

export function ds_file_to_typescript(def: ds_Definition): string {
  const imports = imports_to_typescript(def.imports);
  const definitions = definition_to_typescript(def.definitions);

  return imports + "\n\n" + definitions;
}

function imports_to_typescript(imports?: Map<string, string[]>): string {
  return _(imports)
    .toPairs()
    .map(([file, symbols]) => {
      const symbols_string = _.join(symbols, ", ");

      return `import ${symbols_string} from '${file}';`;
    })
    .join("\n\n");
}

function definition_to_typescript(
  definitions?: Map<string, ds_Schema>
): string {
  return _(definitions)
    .toPairs()
    .map(([name, schema]: [string, ds_Schema]) => {
      const [schema_type, schema_value] = schema;

      switch (schema_type) {
        case "string":
        case "number":
        case "integer":
        case "boolean":
        case "map":
        case "array":
        case "oneOf":
        case "enum":
        case "ref":
          return `export type ${name} = ${schema_to_typescript(schema)};`;
        case "object":
          const obj = schema_value;
          const declaration = `export interface ${name}`;
          if (obj.extends) {
            const supers = _(obj.extends).join(", ");
            const obj_ts = schema_to_typescript([
              "object",
              {
                ...obj,
                extends: undefined,
              },
            ]);

            return `${declaration} extends ${supers} ${obj_ts}`;
          }

          return `${declaration} ${schema_to_typescript(schema)}`;
        default:
          return "";
      }
    })
    .join("\n\n");
}

function schema_to_typescript(schema: ds_Schema): string {
  const [schema_type, schema_value] = schema;

  switch (schema_type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "map":
      const key = schema_to_typescript(schema_value.key);
      const value = schema_to_typescript(schema_value.value);
      return `Map<${key}, ${value}>`;
    case "array":
      return `${schema_to_typescript(schema_value.items)}[]`;
    case "tuple":
      const items = _(schema_value.items)
        .map((item) => schema_to_typescript(item))
        .join(", ");
      return `[${items}]`;
    case "object":
      const props = _(schema_value.properties)
        .toPairs()
        .map(([name, value]) => {
          const optional = _(schema_value.required).some((req) => req === name)
            ? ""
            : "?";

          return `${name}${optional}: ${schema_to_typescript(value)},`;
        })
        .join("\n");

      const obj_string = `{\n${props}\n}`;
      return schema_value.extends
        ? _([...schema_value.extends, obj_string]).join(" & ")
        : obj_string;
    case "enum":
      return `enum []`;
    case "oneOf": {
      return _(schema_value.these)
        .toPairs()
        .map(
          ([name, value]: [string, ds_Schema]) =>
            `| ['${name}', ${schema_to_typescript(value)}]`
        )
        .join("\n");
    }
    case "ref":
      return schema_value;
    default:
      return `// Unknown type '${schema_type}'`;
  }
}
