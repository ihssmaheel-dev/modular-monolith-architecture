module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "import"],
  extends: ["plugin:@typescript-eslint/recommended"],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  overrides: [
    {
      files: ["src/modules/*/infrastructure/**"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["src/modules/*/application/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["*infrastructure/schemas*"],
                message:
                  "Application services must NEVER import Mongoose schemas directly. Use repositories.",
              },
              {
                group: ["../../*/infrastructure/**"],
                message: "Cross-module infrastructure imports are strictly forbidden.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/modules/*/presentation/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["*modules/*/infrastructure/**"],
                message: "Controllers must NEVER import anything from the infrastructure layer.",
              },
            ],
          },
        ],
      },
    },
  ],
};
