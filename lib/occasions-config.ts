export type Occasion = {
  slug: string;
  label: string;
  emoji: string;
  description: string;
};

export const OCCASIONS: Occasion[] = [
  { slug: "wedding",      label: "Wedding",      emoji: "💍", description: "Elegant arrangements for your special day." },
  { slug: "birthday",     label: "Birthday",     emoji: "🎂", description: "Bright and cheerful bouquets to celebrate." },
  { slug: "anniversary",  label: "Anniversary",  emoji: "🥂", description: "Romantic arrangements for milestone moments." },
  { slug: "romance",      label: "Romance",      emoji: "🌹", description: "Intimate bouquets for dates and declarations." },
  { slug: "graduation",   label: "Graduation",   emoji: "🎓", description: "Vibrant bouquets to celebrate achievements." },
  { slug: "sympathy",     label: "Sympathy",     emoji: "🕊️", description: "Gentle arrangements to offer comfort." },
  { slug: "get-well",     label: "Get Well",     emoji: "🌻", description: "Uplifting arrangements to brighten recovery." },
  { slug: "just-because", label: "Just Because", emoji: "🎁", description: "Surprise someone special for no reason at all." },
];
