import audiosprite, { Option } from "audiosprite";
import fs from "fs";
import prettier from "prettier";

var files = ["src/sounds/individual/*"];
var opts: Option = {
  output: "src/sounds/sprite",
  format: null,
  export: "mp3",
};

audiosprite(files, opts, function (err, result) {
  if (err) return console.error(err);

  console.log(JSON.stringify(result, null, 2));

  const filepath = "src/sounds/sprite.ts";

  let code = `
    import url from "./sprite.mp3"

    // ----
    // GENERATED CODE: Do not edit manually.
    // Update by running: yarn gen:audiosprite
    // ----

    export const soundSpriteUrl: string = url;
    export const soundSpriteMap = {
  `;

  Object.entries(result.spritemap).forEach(([key, value]) => {
    code += `${key}: [${value.start * 1000}, ${
      value.end * 1000
    }] as [number, number],`;
  });

  code += `
    };

    export type SoundId = keyof typeof soundSpriteMap;
  `;

  code = prettier.format(code, {
    ...(prettier.resolveConfig.sync(filepath) || {}),
    filepath,
  });

  fs.writeFileSync(filepath, code);
});
