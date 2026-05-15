export const PROVIDERS = {
  lucide: {
    name: 'Lucide',
    description: 'Beautiful & consistent stroke icons (Feather fork)',
    url: 'https://unpkg.com/lucide-static@latest/icons/{name}.svg',
    listUrl: 'https://unpkg.com/lucide-static@latest/icons/',
    license: 'ISC',
    homepage: 'https://lucide.dev',
    style: 'stroke',
    viewBox: '0 0 24 24',
  },
  heroicons: {
    name: 'Heroicons',
    description: 'Hand-crafted SVG icons by Tailwind Labs',
    url: 'https://unpkg.com/heroicons@2/24/outline/{name}.svg',
    license: 'MIT',
    homepage: 'https://heroicons.com',
    style: 'stroke',
    viewBox: '0 0 24 24',
    variants: {
      outline: 'https://unpkg.com/heroicons@2/24/outline/{name}.svg',
      solid: 'https://unpkg.com/heroicons@2/24/solid/{name}.svg',
      mini: 'https://unpkg.com/heroicons@2/20/solid/{name}.svg',
    },
  },
  bootstrap: {
    name: 'Bootstrap Icons',
    description: 'Official Bootstrap open-source icon library',
    url: 'https://unpkg.com/bootstrap-icons@latest/icons/{name}.svg',
    license: 'MIT',
    homepage: 'https://icons.getbootstrap.com',
    style: 'fill',
    viewBox: '0 0 16 16',
  },
  material: {
    name: 'Material Symbols',
    description: 'Google Material Design icons',
    url: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/default/24px.svg',
    license: 'Apache-2.0',
    homepage: 'https://fonts.google.com/icons',
    style: 'fill',
    viewBox: '0 -960 960 960',
    variants: {
      outlined: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/default/24px.svg',
      rounded: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/{name}/default/24px.svg',
      sharp: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolssharp/{name}/default/24px.svg',
    },
  },
  fontawesome: {
    name: 'Font Awesome (Free)',
    description: 'Iconic font and CSS toolkit (free SVGs)',
    url: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/{name}.svg',
    license: 'CC BY 4.0 / MIT',
    homepage: 'https://fontawesome.com',
    style: 'fill',
    viewBox: '0 0 512 512',
    variants: {
      regular: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/{name}.svg',
      solid: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/{name}.svg',
      brands: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/{name}.svg',
    },
  },
  tabler: {
    name: 'Tabler Icons',
    description: 'Over 4000 free MIT-licensed SVG icons',
    url: 'https://unpkg.com/@tabler/icons@latest/icons/outline/{name}.svg',
    license: 'MIT',
    homepage: 'https://tabler.io/icons',
    style: 'stroke',
    viewBox: '0 0 24 24',
    variants: {
      outline: 'https://unpkg.com/@tabler/icons@latest/icons/outline/{name}.svg',
      filled: 'https://unpkg.com/@tabler/icons@latest/icons/filled/{name}.svg',
    },
  },
};

export function getProviderUrl(provider, name, variant) {
  const p = PROVIDERS[provider];
  if (!p) return null;
  if (variant && p.variants?.[variant]) {
    return p.variants[variant].replace('{name}', name);
  }
  return p.url.replace('{name}', name);
}

export function listProviders() {
  return Object.entries(PROVIDERS).map(([key, p]) => ({
    key,
    name: p.name,
    description: p.description,
    license: p.license,
    homepage: p.homepage,
    variants: p.variants ? Object.keys(p.variants) : [],
  }));
}
