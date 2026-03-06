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
    description: 'The classic shadcn/ui + Vercel aesthetic',
    accentColor: '#ffffff',
    accentColorLight: '#18181b',
  },
  {
    id: 'hostman-orange',
    name: 'Hostman Orange',
    description: 'Postman-inspired warm orange palette',
    accentColor: '#ff6c37',
    accentColorLight: '#ff6c37',
  },
  {
    id: 'ewtube-red',
    name: 'EWTube Red',
    description: 'YouTube-inspired bold red palette',
    accentColor: '#ff0000',
    accentColorLight: '#cc0000',
  },
  {
    id: 'lithub-blue',
    name: 'Lithub Blue',
    description: 'GitHub-inspired blue developer palette',
    accentColor: '#58a6ff',
    accentColorLight: '#0969da',
  },
  {
    id: 'shotsapp-green',
    name: 'ShotsApp Green',
    description: 'WhatsApp-inspired teal green palette',
    accentColor: '#25d366',
    accentColorLight: '#128c7e',
  },
  {
    id: 'clapchat-yellow',
    name: 'ClapChat Yellow',
    description: 'Snapchat-inspired bold yellow palette',
    accentColor: '#fffc00',
    accentColorLight: '#f7c948',
  },
];
