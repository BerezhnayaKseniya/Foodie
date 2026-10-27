
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriterecipes: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,

  reducers: {
    toggleFavorite: (state, action) => {
      const recipe = action.payload;

      if (!recipe) {
        return;
      }

      const recipeId = recipe.idFood ?? recipe.recipeId;

      if (recipeId == null) {
        return;
      }

      // Check if recipe already exists in favorites
      const existingIndex = state.favoriterecipes.findIndex(
        (item) =>
          String(item.idFood ?? item.recipeId) ===
          String(recipeId)
      );

      if (existingIndex !== -1) {
        // Remove recipe from favorites
        state.favoriterecipes.splice(existingIndex, 1);
      } else {
        // Add recipe to favorites
        state.favoriterecipes.push(recipe);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;

export default favoritesSlice.reducer;
