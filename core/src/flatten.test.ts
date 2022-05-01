import test from "tape";
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
      one: {
        type: "string",
      },
      two: {
        type: "number",
      },
    }),
  },
];

const b: ds_Schema = [
  "object",
  {
    extends: ["a"],
    properties: to_map({
      composition: {
        type: "ref",
        to: "a",
      },
    }),
  },
];

const sample_definition: ds_Definition = {
  definitions: to_map({ a, b }),
};

const flat_b = flatten_object(b[1], sample_definition);

test("flatten object works with extends", (t) => {
  a[1].properties.forEach((value, key) => {
    t.true(flat_b.properties.has(key), `flat_b should have ${key}`);
    t.deepEqual(flat_b.properties.get(key), value);
  });

  t.end();
});

test("flatten object inlines refs", (t) => {
  const composition = flat_b.properties.get("composition");

  t.deepEqual(composition, a);
  t.end();
});

const one_of: ds_Schema = [
  "oneOf",
  {
    these: to_map({
      a: { type: "ref", to: "a" },
      b: { type: "ref", to: "b" },
    }),
  },
];

test("flatten one ofs", (t) => {
  const flat_one_of = flatten_schema(one_of, sample_definition);

  if (flat_one_of[0] !== "oneOf") {
    t.fail("didn't return a one of");
    return;
  }

  t.deepEqual(flat_one_of[1].these.get("a"), a);

  t.deepEqual(flat_one_of[1].these.get("b"), flat_b);

  t.end();
});

test("recursive definitions", (t) => {
  const recursive: ds_Definition = {
    definitions: to_map({
      a: { type: "ref", to: "a" },
    }),
  };
  const a = recursive.definitions?.get("a");
  if (!a) {
    t.fail();
    return;
  }

  const flat_a = flatten_schema(a, recursive);
  t.deepEqual(a, flat_a);

  t.end();
});

test("almost recursive definitions", (t) => {
  const almost_recursive: ds_Definition = {
    definitions: to_map({
      a: { type: "number" },
      obj: {
        type: "object",
        properties: to_map({
          one_a: { type: "ref", to: "a" },
          nest: {
            type: "object",
            properties: to_map({
              two_a: { type: "ref", to: "a" },
            }),
          },
        }),
      },
    }),
  };

  const obj = almost_recursive.definitions?.get("obj");
  const a = almost_recursive.definitions?.get("a");
  if (!obj || !a) {
    t.fail();
    return;
  }

  const flat = flatten_schema(obj, almost_recursive);
  const flat_obj = flat[1] as ds_Object;

  t.deepEqual(flat_obj.properties.get("one_a"), a);

  const nest = flat_obj.properties.get("nest");
  const flat_nest =
    nest && nest[1] ? (nest[1] as ds_Object) : { properties: new Map() };

  t.deepEqual(flat_nest.properties.get("two_a"), a);

  t.end();
});
