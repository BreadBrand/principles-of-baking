import type { IntlShape } from "react-intl";
import type { Meta } from "../types/models";
import { formatDuration } from "./recipeDuration";

export const formatRecipeMeta = (meta: Meta | undefined, intl: IntlShape): string[] => {
  if (!meta) return [];

  const items: string[] = [];

  const author = meta.author?.trim();
  if (author) {
    items.push(intl.formatMessage({ id: "recipeDetailView.author", defaultMessage: "By {author}" }, { author }));
  }

  const servings = meta.servings?.trim();
  if (servings) {
    items.push(intl.formatMessage({ id: "recipeDetailView.servings", defaultMessage: "Servings: {servings}" }, { servings }));
  }

  const prep = formatDuration(meta.prepTime, intl);
  if (prep) {
    items.push(intl.formatMessage({ id: "recipeDetailView.prepTime", defaultMessage: "Prep: {time}" }, { time: prep }));
  }

  const cook = formatDuration(meta.cookTime, intl);
  if (cook) {
    items.push(intl.formatMessage({ id: "recipeDetailView.cookTime", defaultMessage: "Cook: {time}" }, { time: cook }));
  }

  const additional = formatDuration(meta.additionalTime, intl);
  if (additional) {
    items.push(intl.formatMessage({ id: "recipeDetailView.additionalTime", defaultMessage: "Additional: {time}" }, { time: additional }));
  }

  return items;
};
