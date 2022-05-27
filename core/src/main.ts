import _ from "lodash";

import { ds_file_to_typescript } from "./generate";
import { format } from "prettier";
import { read_def_from_file } from "./reader";
import { promises as fs } from "fs";
import path from "path";

const languages = {
  ts: {
    dir: "ts-gen",
    extension: "ts",
    fn: ds_file_to_typescript,
    pretty: (code: string) => format(code, { parser: "typescript" }),
  },
};

async function main() {
  const filenames = _(process.argv).drop(2).value() || [];
  const langs = ["ts"];

  filenames.forEach(async (file) => {
    const data = await read_def_from_file(file);
    const path_obj = path.parse(file);

    langs.forEach((lang) => {
      // TODO as any eww
      const lang_obj = (languages as any)[lang];

      const code = lang_obj.fn(data);
      const pretty = lang_obj.pretty(code);

      // TODO we should output to pwd and not relative to each file
      const output_folder = path.join(path_obj.dir, lang_obj.dir);
      const output_file = `${path_obj.name}.${lang_obj.extension}`;
      const output_path = path.join(output_folder, output_file);

      fs.writeFile(output_path, pretty);
    });
  });
}

main();
