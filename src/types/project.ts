export type Project = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string[];
  /** Drives the card's accent + the detail view header. */
  accent: 'cyan' | 'yellow' | 'red';
  blurb: string;
  body: string[];
  stack: string[];
  link?: string;
};