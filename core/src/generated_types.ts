export type ds_DefinitionBunch = Map<string, ds_Definition>;

export interface ds_Definition {
  imports?: Map<string, string[]>;
  definitions?: Map<string, ds_Schema>;
}

export type ds_Schema =
  | ["string", ds_String]
  | ["number", ds_Number]
  | ["integer", ds_Integer]
  | ["boolean", ds_Boolean]
  | ["map", ds_Map]
  | ["array", ds_Array]
  | ["tuple", ds_Tuple]
  | ["object", ds_Object]
  | ["enum", ds_Enum]
  | ["oneOf", ds_OneOf]
  | ["ref", ds_Ref];

export interface ds_Base {
  title?: string;
  format?: string;
  description?: string;
}

export interface ds_String extends ds_Base {
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
}

export interface ds_Number extends ds_Base {
  bits?: number;
  validation?: {
    min?: number;
    max?: number;
  };
}

export interface ds_Integer extends ds_Base {
  bits?: number;
  validation?: {
    min?: number;
    max?: number;
  };
}

export interface ds_Boolean extends ds_Base {}

export interface ds_Map extends ds_Base {
  key: ds_Schema;
  value: ds_Schema;
}

export interface ds_Array extends ds_Base {
  items: ds_Schema;
}

export interface ds_Tuple extends ds_Base {
  items: ds_Schema[];
}

export interface ds_Object extends ds_Base {
  properties: Map<string, ds_Schema>;
  required?: string[];
  extends?: string[];
}

export interface ds_Enum extends ds_Base {
  of?: string[];
}

export interface ds_OneOf extends ds_Base {
  these: Map<string, ds_Schema>;
  tag?: string;
}

export interface ds_Ref {
  to: string;
}
