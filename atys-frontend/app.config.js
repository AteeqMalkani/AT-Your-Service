const isWindows = process.platform === "win32";

module.exports = ({ config }) => {
  const existingPlugins = (config.plugins ?? []).filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;

    return (
      pluginName !== "expo-build-properties" &&
      pluginName !== "expo-speech-recognition"
    );
  });

  return {
    ...config,
    plugins: [
      ...existingPlugins,
      "expo-speech-recognition",
      [
        "expo-build-properties",
        {
          android: isWindows ? { cmakeVersion: "3.31.6" } : {},
        },
      ],
    ],
  };
};
