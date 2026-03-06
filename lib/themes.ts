export type ThemeId =
  | 'og-shadcn'
  | 'hostman-orange'
  | 'ewtube-red'
  | 'lithub-blue'
  | 'shotsapp-green'
  | 'clapchat-yellow';

export type ThemeMode = 'light' | 'dark';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  accentColor: string;
  accentColorLight: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'og-shadcn',
    name: 'OG-shadcn',
    description: 'Clean zinc dark, white accents',
    accentColor: '#ffffff',
    accentColorLight: '#18181b',
  },
  {
    id: 'hostman-orange',
    name: 'Hostman Orange',
    description: 'Warm dark grays, bold orange',
    accentColor: '#ff6c37',
    accentColorLight: '#ff6c37',
  },
  {
    id: 'ewtube-red',
    name: 'EwTube Red',
    description: 'Near-black canvas, vivid red',
    accentColor: '#ff0000',
    accentColorLight: '#cc0000',
  },
  {
    id: 'lithub-blue',
    name: 'Lithub Blue',
    description: 'Slate dark, developer blue',
    accentColor: '#58a6ff',
    accentColorLight: '#0969da',
  },
  {
    id: 'shotsapp-green',
    name: 'ShotsApp Green',
    description: 'Deep green-black, teal accent',
    accentColor: '#25d366',
    accentColorLight: '#128c7e',
  },
  {
    id: 'clapchat-yellow',
    name: 'ClapChat Yellow',
    description: 'Dark charcoal, electric yellow',
    accentColor: '#fffc00',
    accentColorLight: '#f7c948',
  },
];
