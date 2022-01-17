export type ds_DefinitionBunch = Map<string, ds_Definition>;

export interface ds_Definition {
  imports?: Map<string, string[]>;
  definitions?: Map<string, ds_Schema>;
}

export type ds_Schema =
  | ({ type: "string" } & ds_String)
  | ({ type: "number" } & ds_Number)
  | ({ type: "integer" } & ds_Integer)
  | ({ type: "boolean" } & ds_Boolean)
  | ({ type: "map" } & ds_Map)
  | ({ type: "array" } & ds_Array)
  | ({ type: "object" } & ds_Object)
  | ({ type: "enum" } & ds_Enum)
  | ({ type: "oneOf" } & ds_OneOf)
  | ({ type: "oneOfType" } & ds_OneOfType)
  | ({ type: "ref" } & ds_Ref);

export interface ds_Base {
  title?: string;
  format?: string;
  description?: string;
}

export interface ds_String {
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
}

export interface ds_Number {
  bits?: number;
  validation?: {
    min?: number;
    max?: number;
  };
}

export interface ds_Integer {
  bits?: number;
  validation?: {
    min?: number;
    max?: number;
  };
}

export interface ds_Boolean {}

export interface ds_Map {
  key: ds_Schema;
  value: ds_Schema;
}

export interface ds_Array {
  items: ds_Schema;
}

export interface ds_Object {
  properties: Map<string, ds_Schema>;
  required?: string[];
  extends?: string[];
}

export interface ds_Enum {
  of?: string[];
}

export interface ds_OneOf {
  these: Map<string, ds_Schema>;
  tag?: string;
}

export interface ds_OneOfType {
  these: ds_Schema[];
}

export interface ds_Ref {
  to: string;
}
