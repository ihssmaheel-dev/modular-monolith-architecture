const tsNode = require("ts-node");

tsNode.register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
});

require("migrate-mongo/bin/migrate-mongo.js");
