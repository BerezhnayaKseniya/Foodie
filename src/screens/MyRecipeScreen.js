
import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";

const STORAGE_KEY = "customrecipes";

export default function MyRecipeScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isWideScreen = width >= 800;

  // Load recipes when opening or returning to this screen
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchRecipes = async () => {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        try {
          const storedRecipes = await AsyncStorage.getItem(
            STORAGE_KEY
          );

          const parsedRecipes = storedRecipes
            ? JSON.parse(storedRecipes)
            : [];

          if (!Array.isArray(parsedRecipes)) {
            throw new Error("Invalid recipes format");
          }

          if (isActive) {
            setRecipes(parsedRecipes);
          }
        } catch (err) {
          console.error("Error loading recipes:", err);

          if (isActive) {
            setRecipes([]);
            setError("Could not load saved recipes.");
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchRecipes();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Back to previous screen
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  // Open form for creating a new recipe
  const handleAddRecipe = () => {
    navigation.navigate("RecipesFormScreen");
  };

  // Open recipe details
  const handleRecipeClick = (recipe) => {
    navigation.navigate("CustomRecipesScreen", {
      recipe,
    });
  };

  // Open form for editing a recipe
  const editRecipe = (recipe, index) => {
    navigation.navigate("RecipesFormScreen", {
      recipeToEdit: recipe,
      recipeIndex: index,
    });
  };

  // Delete recipe from AsyncStorage
  const performDeleteRecipe = async (index) => {
    try {
      const updatedRecipes = recipes.filter(
        (_, recipeIndex) => recipeIndex !== index
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedRecipes)
      );

      setRecipes(updatedRecipes);
      setError("");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Could not delete recipe.");
    }
  };

  // Ask for confirmation before deleting
  const deleteRecipe = (index) => {
    const recipe = recipes[index];

    if (!recipe) {
      return;
    }

    const recipeTitle =
      recipe.title || recipe.recipeName || "this recipe";

    if (
      Platform.OS === "web" &&
      typeof window !== "undefined"
    ) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${recipeTitle}"?`
      );

      if (confirmed) {
        performDeleteRecipe(index);
      }

      return;
    }

    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipeTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDeleteRecipe(index),
        },
      ]
    );
  };

  // Get preview description
  const getRecipeDescription = (recipe) => {
    const rawDescription =
      recipe.description ||
      recipe.recipeInstructions ||
      recipe.instructions ||
      "";

    const description = Array.isArray(rawDescription)
      ? rawDescription.join(" ")
      : String(rawDescription);

    if (!description.trim()) {
      return "No description available.";
    }

    if (description.length > 110) {
      return description.substring(0, 110).trim() + "...";
    }

    return description;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>
          My Recipes
        </Text>

        <Text style={styles.pageSubtitle}>
          Create and manage your own recipes
        </Text>

        {/* Add New Recipe */}
        <TouchableOpacity
          onPress={handleAddRecipe}
          style={styles.addButton}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>
            + Add New Recipe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#F59E0B"
          />

          <Text style={styles.loadingText}>
            Loading recipes...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {recipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                🍽️
              </Text>

              <Text style={styles.noRecipesTitle}>
                No recipes added yet!
              </Text>

              <Text style={styles.noRecipesText}>
                Create your first recipe by clicking
                the Add New Recipe button.
              </Text>
            </View>
          ) : (
            <View style={styles.recipeList}>
              {recipes.map((recipe, index) => {
                const recipeTitle =
                  recipe.title ||
                  recipe.recipeName ||
                  "Untitled Recipe";

                const recipeImage =
                  recipe.image || recipe.recipeImage;

                return (
                  <View
                    key={String(
                      recipe.id ??
                      recipe.recipeId ??
                      index
                    )}
                    style={[
                      styles.recipeCard,
                      {
                        width: isWideScreen
                          ? 340
                          : "100%",
                      },
                    ]}
                    testID="recipeCard"
                  >
                    {/* Recipe details */}
                    <TouchableOpacity
                      onPress={() =>
                        handleRecipeClick(recipe)
                      }
                      testID="handlerecipeBtn"
                      activeOpacity={0.8}
                    >
                      {recipeImage ? (
                        <Image
                          source={{ uri: recipeImage }}
                          style={styles.recipeImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={styles.imagePlaceholder}
                        >
                          <Text
                            style={styles.placeholderText}
                          >
                            No image
                          </Text>
                        </View>
                      )}

                      <View style={styles.recipeContent}>
                        <Text
                          style={styles.recipeTitle}
                          numberOfLines={2}
                        >
                          {recipeTitle}
                        </Text>

                        <Text
                          style={styles.recipeDescription}
                          testID="recipeDescp"
                          numberOfLines={3}
                        >
                          {getRecipeDescription(recipe)}
                        </Text>

                        <Text style={styles.viewDetails}>
                          View Recipe →
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Edit and Delete */}
                    <View
                      style={styles.actionButtonsContainer}
                      testID="editDeleteButtons"
                    >
                      <TouchableOpacity
                        onPress={() =>
                          editRecipe(recipe, index)
                        }
                        style={styles.editButton}
                      >
                        <Text style={styles.actionButtonText}>
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          deleteRecipe(index)
                        }
                        style={styles.deleteButton}
                      >
                        <Text style={styles.actionButtonText}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },

  backButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "flex-start",
    marginBottom: 18,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  recipeList: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 16,
  },

  recipeCard: {
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 14,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  recipeImage: {
    width: "100%",
    height: 170,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    width: "100%",
    height: 170,
    backgroundColor: "#FFF7E6",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 15,
    color: "#9CA3AF",
  },

  recipeContent: {
    paddingHorizontal: 15,
    paddingTop: 12,
  },

  recipeTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },

  recipeDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    marginBottom: 12,
  },

  viewDetails: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },

  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 15,
    paddingTop: 15,
    marginTop: "auto",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  actionButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
  },

  emptyContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 20,
    maxWidth: 450,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 14,
  },

  noRecipesTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 10,
  },

  noRecipesText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: "#6B7280",
  },

  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    marginVertical: 10,
  },
});
