module.exports = function (api) {
  api.cache(true);
  return {
    // NOTE: nativewind/babel exports a preset ({ plugins: [...] }),
    // so it belongs in presets — putting it in plugins fails with
    // ".plugins is not a valid Plugin property".
    presets: ["babel-preset-expo", "nativewind/babel"],
  };
};
