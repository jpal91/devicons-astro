import Color from "colorjs.io";

export type ColorObject = {
  bgLight?: string;
  bgDark?: string;
  minContrastDark?: number;
  minContrastLight?: number;
  fallbackDark?: string;
  fallbackLight?: string;
};

const getResponsiveColors = (
  bgColors: true | ColorObject,
  icoColor: string,
) => {
  let bgLight: Color,
    bgDark: Color,
    minContrastDark: number,
    minContrastLight: number;
  let fallbackDark: string | undefined, fallbackLight: string | undefined;
  const iconColor = new Color(icoColor);

  if (bgColors === true) {
    bgLight = new Color("#fff");
    bgDark = new Color("#000");
    minContrastDark = 3;
    minContrastLight = 3;
  } else {
    bgLight = new Color(bgColors.bgLight ?? "#fff");
    bgDark = new Color(bgColors.bgDark ?? "#000");
    minContrastDark = bgColors.minContrastDark ?? 3;
    minContrastLight = bgColors.minContrastLight ?? 3;
  }

  if (bgLight.contrastWCAG21(iconColor) < minContrastLight) {
    fallbackLight =
      typeof bgColors === "object"
        ? (bgColors.fallbackLight ?? "#000")
        : "#000";
  } else {
    fallbackLight = iconColor.toString();
  }

  if (bgDark.contrastWCAG21(iconColor) < minContrastDark) {
    fallbackDark =
      typeof bgColors === "object" ? (bgColors.fallbackDark ?? "#fff") : "#fff";
  } else {
    fallbackDark = iconColor.toString();
  }

  return { fallbackDark, fallbackLight };
};

export default getResponsiveColors;
