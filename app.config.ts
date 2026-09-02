import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT || "development";

  const isDev = variant === "development";
  const isPreview = variant === "preview";

  const getAppName = (): string => {
    if (isDev) return "EECMY (Dev)";
    if (isPreview) return "EECMY (Preview)";
    return "EECMY Lectionary";
  };

  const getPackage = (): string => {
    if (isDev) return "com.sukkoth.eecmylectionary.dev";
    if (isPreview) return "com.sukkoth.eecmylectionary.preview";
    return "com.sukkoth.eecmylectionary";
  };

  const getScheme = (): string => {
    if (isDev) return "eecmy-lectionary-dev";
    if (isPreview) return "eecmy-lectionary-preview";
    return "eecmy-lectionary";
  };

  const getIcon = (): string => {
    if (isDev) return "./assets/images/dev-icon.png";
    if (isPreview) return "./assets/images/preview-icon.png";
    return "./assets/images/icon.png";
  };

  const getAdaptiveForegroundImage = (): string => {
    if (isDev) return "./assets/images/dev-icon.png";
    if (isPreview) return "./assets/images/preview-icon.png";
    return "./assets/images/adaptive-icon.png";
  };

  return {
    ...config,
    name: getAppName(),
    slug: "eecmy-lectionary",
    scheme: getScheme(),
    icon: getIcon(),
    ios: {
      ...config.ios,
      bundleIdentifier: getPackage(),
    },
    android: {
      ...config.android,
      package: getPackage(),
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        foregroundImage: getAdaptiveForegroundImage(),
        backgroundColor: config.android?.adaptiveIcon?.backgroundColor ?? "#ffffff",
      },
    },
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
