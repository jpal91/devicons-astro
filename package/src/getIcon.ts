import fs from "fs/promises";
import path from "path";

type Aliases = {
  base: keyof DevIcon["versions"]["svg"];
  alias: string;
};

type DevIcon = {
  name: string;
  versions: {
    svg: string[];
  };
  aliases: Aliases[];
};

type IconData = {
  viewBox: string;
  inner: string;
};

export const Variants = [
  "original",
  "plain",
  "line",
  "original-wordmark",
  "plain-wordmark",
  "line-wordmark",
] as const;

// Because the typescript compiler is dumb sometimes
const variants = [...Variants] as string[];

const CACHE_JSON = path.join(import.meta.dirname, "cache.json");
const DEVICONS_JSON = path.join(import.meta.dirname, "devicons.json");
const CDN_URL = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
const ICON_REGEX = /<svg(?:.*?)viewBox="(.*?)"(?:.*?)>(.*?)<\/svg>/s;

const devIconsJsonFile = await fs.readFile(DEVICONS_JSON, { encoding: "utf8" });
const devIconsJson = JSON.parse(devIconsJsonFile) as DevIcon[];
let devIcons: Record<string, IconData>;

try {
  const json = await fs.readFile(CACHE_JSON, { encoding: "utf8" });
  devIcons = JSON.parse(json);
} catch {
  devIcons = {};
}

const genError = (name: string, version: string) => {
  const nameVerMix: string | undefined = variants.find((v) => name.endsWith(v));

  if (nameVerMix) {
    const nameWithoutVariant = name
      .replace(nameVerMix, "")
      .replace(/(.*)-$/, "$1");
    throw new Error(
      `You have included the variant type with the name. Pass the variant name separately instead (ie name="${nameWithoutVariant}" variant="${nameVerMix}"`,
    );
  } else if (!variants.includes(version)) {
    throw new Error(
      `Invalid variant type of ${version}. Must be one of '${variants.join(", ")}'`,
    );
  } else {
    throw new Error(
      `Could not find icon with name: ${name}, variant: ${version}`,
    );
  }
};

const getUrlPath = (name: string, version: string) => {
  const targetIcon = devIconsJson.find((i) => i.name === name);

  if (!targetIcon) {
    genError(name, version);
  }

  if (version in targetIcon.versions.svg) {
    return `${name}/${name}-${version}.svg`;
  }

  const alias = targetIcon.aliases.find((a) => a.alias === version);

  if (!alias) {
    genError(name, version);
  }

  return `${name}/${name}-${alias.base as string}.svg`;
};

const iconFromCDN = async (name: string, version: string) => {
  const urlPath = getUrlPath(name, version);
  const url = new URL(urlPath, CDN_URL);
  const res = await fetch(url);
  const raw = await res.text();

  const matches = raw.match(ICON_REGEX);

  if (matches && matches.length <= 2) {
    throw new Error(
      `Could not parse svg data for name: ${name}, version: ${version}`,
    );
  }

  const viewBox = matches[1];
  const inner = matches[2];

  const iconData = {
    inner,
    viewBox,
  } as IconData;

  devIcons[`${name}:${version}`] = iconData;
  await fs.writeFile(CACHE_JSON, JSON.stringify(devIcons));

  return iconData;
};

const getIcon = async (name: string, version: string) => {
  const key = `${name}:${version}`;

  if (!(key in devIcons)) {
    const icon = await iconFromCDN(name, version);
    return icon;
  } else {
    return devIcons[key];
  }
};

export default getIcon;
