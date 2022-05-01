import _ from "lodash";

import { ds_file_to_typescript } from "./generate";
import { read_def_from_file } from "./reader";
import { format } from "prettier";

const filename = _.last(process.argv) || "";

async function main() {
  const data = await read_def_from_file(filename);
  const typescript = ds_file_to_typescript(data);

  console.log(typescript);

  // const pretty = format(typescript, { parser: "typescript" });
  // console.log(pretty);
}

main();
