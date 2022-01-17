import { promises as fs } from "fs";
import { load } from "js-yaml";
import _ from "lodash";

import { ds_Definition } from "./generated_types";

export async function read_bundle_from_files(filenames: string[]) {
  const defs = _.map(filenames, read_def_from_file);

  return Promise.all(defs);
}

export async function read_def_from_file(filename: string) {
  const file = await fs.readFile(filename, "utf-8");
  const json_data = load(file) as ds_Definition;

  return json_data;
}
