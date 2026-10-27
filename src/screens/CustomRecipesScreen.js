
import React from "react";

import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../redux/favoritesSlice";

export default function CustomRecipesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();

  // Recipe passed from MyRecipeScreen
  const recipe = route.params?.recipe;

  // Get favorite recipes from Redux
  const favoriteRecipes = useSelector(
    (state) => state.favorites?.favoriterecipes ?? []
  );

  const recipeId =
    recipe?.idFood ?? recipe?.recipeId ?? recipe?.id;

  const isFavourite =
    recipeId != null &&
    favoriteRecipes.some(
      (item) =>
        String(
          item.idFood ?? item.recipeId ?? item.id
        ) === String(recipeId)
    );

  // Back navigation
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  // Add or remove recipe from favorites
  const handleToggleFavorite = () => {
    if (recipe && recipeId != null) {
      dispatch(toggleFavorite(recipe));
    }
  };

  // Handle missing recipe
  if (!recipe) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>
          No Recipe Details Available
        </Text>

        <TouchableOpacity
          onPress={handleBack}
          style={styles.returnButton}
        >
          <Text style={styles.returnButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Recipe information
  const recipeTitle =
    recipe.title ||
    recipe.recipeName ||
    "Untitled Recipe";

  const recipeImage =
    recipe.image || recipe.recipeImage;

  const recipeDescription =
    recipe.description || "";

  // Get ingredients
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === "string"
    ? recipe.ingredients
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  // Get step-by-step instructions
  const rawInstructions =
    recipe.instructions ??
    recipe.recipeInstructions ??
    recipe.description ??
    "";

  const instructionLines =
    Array.isArray(rawInstructions)
      ? rawInstructions
      : String(rawInstructions).split(/\r?\n/);

  const instructions = instructionLines
    .map((line) =>
      String(line)
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  // Additional information
  const cookingTime = recipe.cookingTime;
  const servings = recipe.servings;
  const calories = recipe.calories;
  const difficulty = recipe.difficulty;

  const formatValue = (value, unit = "") => {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "Not specified";
    }

    const text = String(value).trim();

    if (unit && !isNaN(Number(text))) {
      return `${text} ${unit}`;
    }

    return text;
  };

  const isWideScreen = width >= 700;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      testID="scrollContent"
    >
      <View style={styles.pageContent}>

        {/* Recipe Image */}
        <View
          style={styles.imageContainer}
          testID="imageContainer"
        >
          {recipeImage ? (
            <Image
              source={{ uri: recipeImage }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                No image available
              </Text>
            </View>
          )}

          {/* Back and Favorite Buttons */}
          <View
            style={styles.topButtonsContainer}
            testID="topButtonsContainer"
          >
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              accessibilityRole="button"
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
        <View
          style={styles.contentContainer}
          testID="contentContainer"
        >
          <Text style={styles.recipeTitle}>
            {recipeTitle}
          </Text>

          <Text style={styles.recipeCategory}>
            My Food
          </Text>

          {/* Cooking Information */}
          <View style={styles.infoContainer}>
            {[
              {
                icon: "⏱️",
                label: "Time",
                value: formatValue(cookingTime, "min"),
              },
              {
                icon: "👥",
                label: "Servings",
                value: formatValue(servings),
              },
              {
                icon: "🔥",
                label: "Calories",
                value: formatValue(calories, "kcal"),
              },
              {
                icon: "📊",
                label: "Difficulty",
                value: formatValue(difficulty),
              },
            ].map((info) => (
              <View
                key={info.label}
                style={[
                  styles.infoCard,
                  {
                    width: isWideScreen
                      ? "23.5%"
                      : "48%",
                  },
                ]}
              >
                <Text style={styles.infoIcon}>
                  {info.icon}
                </Text>

                <Text style={styles.infoLabel}>
                  {info.label}
                </Text>

                <Text style={styles.infoValue}>
                  {info.value}
                </Text>
              </View>
            ))}
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
              ingredients.map((ingredient, index) => {
                let name = "";
                let measure = "";

                if (typeof ingredient === "string") {
                  const parts = ingredient.split("|");
                  name = parts[0]?.trim() || "";
                  measure = parts
                    .slice(1)
                    .join("|")
                    .trim();
                } else {
                  name =
                    ingredient.ingredientName ||
                    ingredient.name ||
                    "Ingredient";

                  measure =
                    ingredient.measure ||
                    ingredient.quantity ||
                    "";
                }

                return (
                  <View
                    key={`ingredient-${index}`}
                    style={styles.ingredientItem}
                  >
                    <View style={styles.ingredientBullet} />

                    <Text style={styles.ingredientName}>
                      {name}
                    </Text>

                    <Text style={styles.ingredientMeasure}>
                      {measure}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                No ingredients available.
              </Text>
            )}
          </View>

          {/* Step-by-Step Instructions */}
          <View
            style={styles.sectionContainer}
            testID="instructionsSection"
          >
            <Text style={styles.sectionTitle}>
              Step-by-Step Instructions
            </Text>

            {instructions.length > 0 ? (
              instructions.map((step, index) => (
                <View
                  key={`step-${index}`}
                  style={styles.instructionItem}
                >
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.instructionText}>
                    {step}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No instructions available.
              </Text>
            )}
          </View>

          {/* Optional Description */}
          {recipeDescription.trim() ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Description
              </Text>

              <Text style={styles.descriptionText}>
                {recipeDescription}
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
    maxWidth: 900,
    alignSelf: "center",
  },

  imageContainer: {
    position: "relative",
    width: "100%",
  },

  recipeImage: {
    width: "100%",
    height: 320,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#FFF7E6",
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    paddingHorizontal: 20,
  },

  backButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
  },

  favoriteButton: {
    backgroundColor: "#FFFFFF",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButtonText: {
    fontSize: 30,
    lineHeight: 36,
    color: "#6B7280",
  },

  favoriteActive: {
    color: "#EF4444",
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  recipeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },

  recipeCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
    marginBottom: 25,
  },

  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  infoCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  infoIcon: {
    fontSize: 25,
    marginBottom: 6,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 5,
  },

  infoValue: {
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
    marginBottom: 15,
  },

  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },

  ingredientBullet: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
    marginRight: 12,
  },

  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
  },

  ingredientMeasure: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    textAlign: "right",
  },

  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  instructionText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 23,
  },

  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },

  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
  },

  notFoundContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  notFoundText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },

  returnButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
