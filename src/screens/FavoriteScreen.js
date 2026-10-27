
import React from "react";

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

export default function FavoriteScreen() {
  const navigation = useNavigation();

  // Get favorite recipes from Redux
  const favoriteRecipesList = useSelector(
    (state) => state.favorites?.favoriterecipes ?? []
  );

  // Back navigation
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  // Open recipe details
  const handleRecipePress = (recipe) => {
    navigation.navigate("RecipeDetail", recipe);
  };

  // Render recipe card
  const renderRecipe = ({ item }) => {
    const recipeTitle =
      item.recipeName || item.title || "Untitled Recipe";

    const recipeImage =
      item.recipeImage || item.image;

    const recipeCategory =
      item.recipeCategory || item.category || "Recipe";

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Open ${recipeTitle}`}
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
              No image
            </Text>
          </View>
        )}

        <View style={styles.recipeInfo}>
          <Text
            style={styles.recipeTitle}
            numberOfLines={2}
          >
            {recipeTitle}
          </Text>

          <Text style={styles.recipeCategory}>
            {recipeCategory}
          </Text>

          <Text
            style={styles.recipeDescription}
            numberOfLines={2}
          >
            {item.cookingDescription ||
              item.recipeInstructions ||
              item.description ||
              ""}
          </Text>

          <Text style={styles.openRecipeText}>
            View Recipe →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          My Favorite Recipes
        </Text>

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
      </View>

      {/* Favorite recipes list */}
      <FlatList
        testID="favoriteRecipes"
        data={favoriteRecipesList}
        keyExtractor={(item, index) =>
          String(item.idFood ?? item.recipeId ?? index)
        }
        renderItem={renderRecipe}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyHeart}>
              ♡
            </Text>

            <Text style={styles.emptyText}>
              No favorite recipes yet!
            </Text>

            <Text style={styles.emptyDescription}>
              Open a recipe and tap the heart icon
              to add it to your favorites.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.browseButton}
            >
              <Text style={styles.browseButtonText}>
                Browse Recipes
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 18,
  },

  backButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    flexGrow: 1,
  },

  cardContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    padding: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",

    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  recipeImage: {
    width: 115,
    height: 105,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    width: 115,
    height: 105,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  recipeInfo: {
    flex: 1,
    justifyContent: "center",
  },

  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
  },

  recipeCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    marginBottom: 6,
  },

  recipeDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    marginBottom: 8,
  },

  openRecipeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#D97706",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },

  emptyHeart: {
    fontSize: 75,
    color: "#F59E0B",
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 10,
  },

  emptyDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 25,
  },

  browseButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  browseButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
