
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../redux/favoritesSlice";

export default function RecipeDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();

  // Recipe passed from HomeScreen
  const recipe = route.params?.recipe ?? route.params;

  // Get favorites from Redux
  const favoriteRecipes = useSelector(
    (state) => state.favorites?.favoriterecipes ?? []
  );

  const recipeId = recipe?.idFood ?? recipe?.recipeId;

  const isFavourite =
    recipeId != null &&
    favoriteRecipes.some(
      (item) =>
        String(item.idFood ?? item.recipeId) === String(recipeId)
    );

  const handleToggleFavorite = () => {
    if (recipe) {
      dispatch(toggleFavorite(recipe));
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  // Format cooking time and calories
  const formatValue = (value, unit = "") => {
    if (value === undefined || value === null || value === "") {
      return "Not specified";
    }

    if (unit && !isNaN(Number(value))) {
      return `${value} ${unit}`;
    }

    return String(value);
  };

  // Handle missing recipe
  if (!recipe) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>
          Recipe not found
        </Text>

        <TouchableOpacity
          onPress={handleBack}
          style={styles.returnButton}
        >
          <Text style={styles.returnButtonText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  const rawInstructions =
    recipe.recipeInstructions ??
    recipe.instructions ??
    recipe.description ??
    "";

  const instructions = Array.isArray(rawInstructions)
    ? rawInstructions.map(String)
    : String(rawInstructions)
        .split(/\r?\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

  const cookingTime =
    recipe.cookingTime ??
    recipe.cookingMinutes ??
    recipe.preparationTime;

  const servings =
    recipe.servings ??
    recipe.portions;

  const calories =
    recipe.calories ??
    recipe.kcal;

  const difficulty =
    recipe.difficulty ??
    recipe.recipeDifficulty;

  const imageHeight = Math.min(
    350,
    Math.max(240, width * 0.38)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageContent}>

        {/* Recipe Image */}
        <View
          style={styles.imageContainer}
          testID="imageContainer"
        >
          {recipe.recipeImage ? (
            <Image
              source={{ uri: recipe.recipeImage }}
              style={[
                styles.recipeImage,
                { height: imageHeight },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { height: imageHeight },
              ]}
            >
              <Text style={styles.placeholderText}>
                No image available
              </Text>
            </View>
          )}

          {/* Back and Favorite Buttons */}
          <View style={styles.topButtonsContainer}>

            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonText}>
                ← Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={
                isFavourite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Text
                style={[
                  styles.favoriteButtonText,
                  isFavourite && styles.favoriteActive,
                ]}
              >
                {isFavourite ? "♥" : "♡"}
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Recipe Details */}
        <View style={styles.contentContainer}>

          <View
            style={styles.recipeDetailsContainer}
            testID="recipeDetailsContainer"
          >
            <Text
              style={styles.recipeTitle}
              testID="recipeTitle"
            >
              {recipe.recipeName || recipe.title || "Untitled Recipe"}
            </Text>

            <Text
              style={styles.recipeCategory}
              testID="recipeCategory"
            >
              {recipe.recipeCategory ||
                recipe.category ||
                "My Recipe"}
            </Text>
          </View>

          {/* Cooking Information */}
          <View
            style={styles.miscContainer}
            testID="miscContainer"
          >
            <View style={styles.miscItem}>
              <Text style={styles.miscIcon}>⏱️</Text>
              <Text style={styles.miscLabel}>Time</Text>
              <Text style={styles.miscText}>
                {formatValue(cookingTime, "min")}
              </Text>
            </View>

            <View style={styles.miscItem}>
              <Text style={styles.miscIcon}>👥</Text>
              <Text style={styles.miscLabel}>Servings</Text>
              <Text style={styles.miscText}>
                {formatValue(servings)}
              </Text>
            </View>

            <View style={styles.miscItem}>
              <Text style={styles.miscIcon}>🔥</Text>
              <Text style={styles.miscLabel}>Calories</Text>
              <Text style={styles.miscText}>
                {formatValue(calories, "kcal")}
              </Text>
            </View>

            <View style={styles.miscItem}>
              <Text style={styles.miscIcon}>📊</Text>
              <Text style={styles.miscLabel}>Difficulty</Text>
              <Text style={styles.miscText}>
                {formatValue(difficulty)}
              </Text>
            </View>
          </View>

          {/* Ingredients */}
          <View
            style={styles.sectionContainer}
            testID="ingredientsSection"
          >
            <Text style={styles.sectionTitle}>
              Ingredients
            </Text>

            {ingredients.length > 0 ? (
              <View
                style={styles.ingredientsList}
                testID="ingredientsList"
              >
                {ingredients.map((ingredient, index) => {
                  const name =
                    typeof ingredient === "string"
                      ? ingredient
                      : ingredient.ingredientName ||
                        ingredient.name ||
                        "Ingredient";

                  const measure =
                    typeof ingredient === "string"
                      ? ""
                      : ingredient.measure ||
                        ingredient.quantity ||
                        "";

                  return (
                    <View
                      key={`ingredient-${index}`}
                      style={styles.ingredientItem}
                    >
                      <View style={styles.ingredientBullet} />

                      <Text style={styles.ingredientText}>
                        {name}
                      </Text>

                      <Text style={styles.ingredientMeasure}>
                        {measure}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No ingredients available.
              </Text>
            )}
          </View>

          {/* Instructions */}
          <View
            style={styles.sectionContainer}
            testID="sectionContainer"
          >
            <Text style={styles.sectionTitle}>
              Instructions
            </Text>

            {instructions.length > 0 ? (
              instructions.map((instruction, index) => (
                <View
                  key={`instruction-${index}`}
                  style={styles.instructionItem}
                >
                  <Text style={styles.instructionsText}>
                    {instruction}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No instructions available.
              </Text>
            )}
          </View>

          {/* Description */}
          {recipe.cookingDescription ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Description
              </Text>

              <Text style={styles.descriptionText}>
                {recipe.cookingDescription}
              </Text>
            </View>
          ) : null}

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 50,
  },

  pageContent: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
  },

  imageContainer: {
    position: "relative",
    width: "100%",
  },

  recipeImage: {
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },

  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  topButtonsContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },

  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButtonText: {
    fontSize: 30,
    color: "#6B7280",
    lineHeight: 36,
  },

  favoriteActive: {
    color: "#EF4444",
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  recipeDetailsContainer: {
    marginBottom: 24,
  },

  recipeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },

  recipeCategory: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F59E0B",
  },

  miscContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  miscItem: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  miscIcon: {
    fontSize: 26,
    marginBottom: 5,
  },

  miscLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },

  miscText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },

  sectionContainer: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 14,
  },

  ingredientsList: {
    width: "100%",
  },

  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },

  ingredientBullet: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FBBF24",
    marginRight: 12,
  },

  ingredientText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },

  ingredientMeasure: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    textAlign: "right",
  },

  instructionItem: {
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  instructionsText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444444",
  },

  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },

  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    marginTop: 8,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  notFoundText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 20,
  },

  returnButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
