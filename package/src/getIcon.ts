import fs from "fs/promises";
import path from "path";
import { parse, stringify, type INode } from "svgson";

type Aliases = {
  base: keyof DevIcon["versions"]["svg"];
  alias: string;
};

type DevIcon = {
  name: string;
  versions: {
    svg: string[];
  };
  color: string;
  aliases: Aliases[];
};

type IconData = {
  svg: INode;
  color: string;
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

let devIconsJson: DevIcon[];

try {
  const devIconsJsonFile = await fs.readFile(DEVICONS_JSON, {
    encoding: "utf8",
  });
  devIconsJson = JSON.parse(devIconsJsonFile) as DevIcon[];
} catch {
  const res = await fetch(
    "https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/devicon.json",
  );
  const json = await res.json();
  devIconsJson = json as DevIcon[];
}

let devIcons: Record<string, IconData>;

try {
  const json = await fs.readFile(CACHE_JSON, { encoding: "utf8" });
  devIcons = JSON.parse(json);
} catch {
  devIcons = {};
}

const genNameError = (name: string) => {
  const nameVerMix: string | undefined = variants.find((v) => name.endsWith(v));

  if (nameVerMix) {
    const nameWithoutVariant = name
      .replace(nameVerMix, "")
      .replace(/(.*)-$/, "$1");
    throw new Error(
      `You have likely included the variant type with the name. Pass the variant to the 'variant' prop separately instead (ie name="${nameWithoutVariant}" variant="${nameVerMix}")`,
    );
  } else {
    throw new Error(
      `Devicons does not contain the icon '${name}'. Please see https://devicon.dev for all icons`,
    );
  }
};

const genAliasError = (icon: DevIcon, badVersion: string | string[]) => {
  const validVariants = [
    ...icon.versions.svg,
    ...icon.aliases.map((a) => a.alias),
  ].join(", ");
  const bversion =
    typeof badVersion === "string" ? badVersion : badVersion.join(", ");

  throw new Error(
    `Devicon '${icon.name}' does not have a variant(s) '${badVersion}'. Valid variants: '${validVariants}'`,
  );
};

const getUrlPath = (name: string, version: string | string[]) => {
  const targetIcon = devIconsJson.find((i) => i.name === name);

  if (!targetIcon) {
    genNameError(name);
  }

  const aliases: Aliases[] = targetIcon.versions.svg.map(
    (v) => ({ base: v, alias: v }) as Aliases,
  );

  aliases.push(...targetIcon.aliases);

  if (typeof version === "string") {
    const match = aliases.find((a) => a.alias === version);

    if (match) {
      return {
        urlPath: `${name}/${name}-${String(match.base)}.svg`,
        variant: match.base,
      };
    }
  } else {
    for (const v of version) {
      const match = aliases.find((a) => a.alias === v);

      if (match) {
        return {
          urlPath: `${name}/${name}-${String(match.base)}.svg`,
          variant: match.base,
        };
      }
    }
  }

  genAliasError(targetIcon, version);
};

const fixInner = (svg: INode, name: string, version: string) => {
  const defsIdx = svg.children.findIndex((child) => child.name === "defs");

  if (defsIdx === -1) {
    return svg;
  }

  const variantId = `${name}-${version}`;

  svg.children.forEach((child) => {
    if (child.name === "defs") {
      child.children.forEach((def) => {
        const id = def.attributes.id;

        if (id) {
          def.attributes.id = `${variantId}-${id}`;
        }
      });
    } else if (child.attributes.fill?.startsWith("url")) {
      const id = child.attributes.fill.slice(5, -1);
      child.attributes.fill = `url(#${variantId}-${id})`;
    }
  });

  return svg;
};

const iconFromCDN = async (name: string, version: string | string[]) => {
  const { urlPath, variant } = getUrlPath(name, version);
  const url = new URL(urlPath, CDN_URL);
  const res = await fetch(url);
  const raw = await res.text();

  let svg = await parse(raw);

  svg.attributes.xmlns = "http://www.w3.org/2000/svg";

  svg = fixInner(svg, name, variant as string);

  const icon = devIconsJson.find((i) => i.name === name);

  const iconData = {
    svg,
    color: icon.color,
  } as IconData;

  devIcons[`${name}:${version}`] = iconData;
  await fs.writeFile(CACHE_JSON, JSON.stringify(devIcons));

  return iconData;
};

const getIcon = async (name: string, version: string | string[]) => {
  const key = `${name}:${version}`;

  if (!(key in devIcons)) {
    const icon = await iconFromCDN(name, version);
    return icon;
  } else {
    return devIcons[key];
  }
};

export default getIcon;
