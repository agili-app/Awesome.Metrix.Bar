import { badgeRecipe } from "./badge.recipe.ts";
import { buttonRecipe } from "./button.recipe.ts";
import { cardRecipe } from "./card.recipe.ts";
import { textLinkRecipe } from "./text-link.recipe.ts";

export const recipes = {
  badge: badgeRecipe,
  button: buttonRecipe,
  textLink: textLinkRecipe,
};

export const slotRecipes = {
  card: cardRecipe,
};
