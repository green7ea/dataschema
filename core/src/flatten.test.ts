import _ from "lodash";

import { ds_Definition, ds_Object, ds_Schema } from "./generated_types";
import { flatten_object, flatten_schema } from "./flatten";

function to_map(obj: object) {
  return new Map(_.toPairs(obj));
}

const a: ds_Schema = [
  "object",
  {
    properties: to_map({
      one: ["string", "one"],
      two: ["number", 2],
    }),
  },
];

const b: ds_Schema = [
  "object",
  {
    extends: ["a"],
    properties: to_map({
      composition: ["ref", "a"],
    }),
  },
];

const sample_definition: ds_Definition = {
  definitions: to_map({ a, b }),
};

const flat_b = flatten_object(b[1], sample_definition);

test("flatten object works with extends", () => {
  a[1].properties.forEach((value, key) => {
    expect(flat_b.properties.get(key)).toEqual(value);
  });
});

test("flatten object inlines refs", () => {
  const composition = flat_b.properties.get("composition");

  expect(composition).toStrictEqual(a);
});

const one_of: ds_Schema = [
  "oneOf",
  {
    these: to_map({
      a: ["ref", "a"],
      b: ["ref", "b"],
    }),
  },
];

test("flatten one ofs", () => {
  const flat_one_of = flatten_schema(one_of, sample_definition);

  if (flat_one_of[0] !== "oneOf") {
    fail("We should get a 'oneOf'");
  }

  expect(flat_one_of[1].these.get("a")).toStrictEqual(a);
  expect(flat_one_of[1].these.get("b")?.at(1)).toStrictEqual(flat_b);
});

test("recursive definitions", () => {
  const recursive: ds_Definition = {
    definitions: to_map({
      a: ["ref", "a"],
    }),
  };
  const a = recursive.definitions?.get("a");
  if (!a) {
    fail("A should be defined");
  }

  const flat_a = flatten_schema(a, recursive);
  expect(a).toStrictEqual(flat_a);
});

test("almost recursive definitions", () => {
  const almost_recursive: ds_Definition = {
    definitions: to_map({
      a: ["number", 1],
      obj: [
        "object",
        {
          properties: to_map({
            one_a: ["ref", "a"],
            nest: [
              "object",
              {
                properties: to_map({
                  two_a: ["ref", "a"],
                }),
              },
            ],
          }),
        },
      ],
    }),
  };

  const obj = almost_recursive.definitions?.get("obj");
  const a = almost_recursive.definitions?.get("a");
  if (!obj || !a) {
    fail("obj and a shoudl be defined");
  }

  const flat = flatten_schema(obj, almost_recursive);
  const flat_obj = flat[1] as ds_Object;

  expect(flat_obj.properties.get("one_a")).toStrictEqual(a);

  const nest = flat_obj.properties.get("nest");
  const flat_nest =
    nest && nest[1] ? (nest[1] as ds_Object) : { properties: new Map() };

  expect(flat_nest.properties.get("two_a")).toStrictEqual(a);
});
