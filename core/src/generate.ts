import _ from "lodash";

import { ds_Definition, ds_Schema } from "./generated_types";

export function ds_file_to_typescript(def: ds_Definition): string {
  const imports = imports_to_typescript(def.imports);
  const definitions = definition_to_typescript(def.definitions);

  return imports + '\n\n' + definitions;
}

function imports_to_typescript(imports?: Map<string, string[]>): string {
  return _(imports)
    .toPairs()
    .map(([file, symbols]) => {
      const symbols_string = _.join(symbols, ', ');

      return `import ${symbols_string} from '${file}';`;
    })
    .join('\n\n');
}

function definition_to_typescript(definitions?: Map<string, ds_Schema>): string {
  return _(definitions)
    .toPairs()
    .map(([name, schema]) => {
      switch (schema.type) {
        case "string":
        case "number":
        case "integer":
        case "boolean":
        case "map":
        case "array":
        case "oneOf":
        case "oneOfType":
        case "enum":
        case "ref":
          return `export type ${name} = ${schema_to_typescript(schema)};`;
        case "object":
          const declaration = `export interface ${name}`;
          if (schema.extends) {
            const supers = _(schema.extends).join(', ');
            const obj = schema_to_typescript({
              ...schema,
              extends: undefined,
            });

            return `${declaration} extends ${supers} ${obj}`
          }

          return `${declaration} ${schema_to_typescript(schema)}`;
        default:
          return "";
      }
    })
    .join("\n\n");
}

function schema_to_typescript(schema: ds_Schema): string {
  switch (schema.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "map":
      const key = schema_to_typescript(schema.key);
      const value = schema_to_typescript(schema.value);
      return `Map<${key}, ${value}>`;
    case "array":
      return `${schema_to_typescript(schema.items)}[]`;
    case "object":
      const props = _(schema.properties)
        .toPairs()
        .map(([name, value]) => {
          const optional = _(schema.required).some((req) => req === name)
            ? ""
            : "?";

          return `${name}${optional}: ${schema_to_typescript(value)},`;
        })
        .join("\n");

      const obj_string = `{\n${props}\n}`;
      return schema.extends
        ? _([...schema.extends, obj_string]).join(' & ')
        : obj_string;
    case "enum":
      return `enum []`;
    case "oneOf": {
      const tag = schema.tag || "type";

      return _(schema.these)
        .toPairs()
        .map(
          ([name, value]) =>
            `| { ${tag}: '${name}' } & ${schema_to_typescript(value)}`
        )
        .join("\n");
    }
    case "oneOfType":
      const types = _(schema.these)
        .sortBy((x) => x.type)
        .sortedUniq()
        .value();

      if (schema.these.length !== types.length) {
        throw "uh oh, oneOfType doesn't have unique types";
      }

      return _(types)
        .map((type) => `| ${schema_to_typescript(type)}`)
        .join("\n");
    case "ref":
      return schema.to;
    default:
      return `// Unknown type`;
  }
}
