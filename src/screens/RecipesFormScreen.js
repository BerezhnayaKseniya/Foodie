
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "customrecipes";

export default function RecipesFormScreen({
  route,
  navigation,
}) {
  const {
    recipeToEdit,
    recipeIndex,
    onrecipeEdited,
  } = route.params || {};

  const isEditing = Boolean(recipeToEdit);

  // Initial form values
  const [title, setTitle] = useState(
    recipeToEdit?.title ??
    recipeToEdit?.recipeName ??
    ""
  );

  const [image, setImage] = useState(
    recipeToEdit?.image ??
    recipeToEdit?.recipeImage ??
    ""
  );

  const [description, setDescription] = useState(
    recipeToEdit?.description ?? ""
  );

  const existingIngredients = Array.isArray(
    recipeToEdit?.ingredients
  )
    ? recipeToEdit.ingredients
        .map((ingredient) => {
          if (typeof ingredient === "string") {
            return ingredient;
          }

          const name =
            ingredient.ingredientName ||
            ingredient.name ||
            "";

          const amount =
            ingredient.measure ||
            ingredient.quantity ||
            "";

          return [name, amount]
            .filter(Boolean)
            .join(" | ");
        })
        .join("\n")
    : recipeToEdit?.ingredients || "";

  const [ingredientsText, setIngredientsText] =
    useState(existingIngredients);

  const existingInstructions =
    recipeToEdit?.instructions ??
    recipeToEdit?.recipeInstructions ??
    recipeToEdit?.description ??
    "";

  const [instructionsText, setInstructionsText] =
    useState(
      Array.isArray(existingInstructions)
        ? existingInstructions.join("\n")
        : String(existingInstructions)
    );

  const [cookingTime, setCookingTime] = useState(
    String(recipeToEdit?.cookingTime ?? "")
  );

  const [servings, setServings] = useState(
    String(recipeToEdit?.servings ?? "")
  );

  const [calories, setCalories] = useState(
    String(recipeToEdit?.calories ?? "")
  );

  const [difficulty, setDifficulty] = useState(
    String(recipeToEdit?.difficulty ?? "")
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Choose image from device
  const pickImage = async () => {
    setError("");

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.3,
          base64: true,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      if (!asset.base64) {
        throw new Error(
          "Could not read this image. Try another photo."
        );
      }

      // Keep images small enough for local storage
      if (asset.base64.length > 2500000) {
        throw new Error(
          "Image is too large. Choose a smaller photo or use an image URL."
        );
      }

      const mimeType =
        asset.mimeType || "image/jpeg";

      const imageData =
        `data:${mimeType};base64,${asset.base64}`;

      setImage(imageData);
    } catch (err) {
      console.error("Image selection error:", err);
      setError(
        err.message || "Could not select image."
      );
    }
  };

  // Parse ingredient lines
  const parseIngredients = () => {
    return ingredientsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("|");

        if (separator === -1) {
          return {
            ingredientName: line,
            measure: "",
          };
        }

        return {
          ingredientName:
            line.substring(0, separator).trim(),
          measure:
            line.substring(separator + 1).trim(),
        };
      })
      .filter((item) => item.ingredientName);
  };

  // Parse instructions into steps
  const parseInstructions = () => {
    return instructionsText
      .split(/\r?\n/)
      .map((line) =>
        line
          .replace(/^\s*\d+[.)]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  };

  // Save or update recipe
  const saveRecipe = async () => {
    if (saving) {
      return;
    }

    setError("");

    const cleanTitle = title.trim();
    const ingredients = parseIngredients();
    const steps = parseInstructions();

    // Validate required fields
    if (!cleanTitle) {
      setError("Please enter a recipe title.");
      return;
    }

    if (ingredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }

    if (steps.length === 0) {
      setError(
        "Please add at least one cooking instruction."
      );
      return;
    }

    setSaving(true);

    try {
      const storedData = await AsyncStorage.getItem(
        STORAGE_KEY
      );

      const recipes = storedData
        ? JSON.parse(storedData)
        : [];

      if (!Array.isArray(recipes)) {
        throw new Error("Invalid recipe storage format.");
      }

      const newId =
        `custom_${Date.now()}_${Math.floor(
          Math.random() * 100000
        )}`;

      const recipeId =
        recipeToEdit?.idFood ||
        recipeToEdit?.recipeId ||
        newId;

      // Recipe data
      const newRecipe = {
        ...recipeToEdit,

        id: recipeToEdit?.id || recipeId,
        idFood: recipeId,
        recipeId: recipeId,

        title: cleanTitle,
        recipeName: cleanTitle,

        image: image.trim(),
        recipeImage: image.trim(),

        description: description.trim(),

        ingredients: ingredients,

        instructions: steps,

        recipeInstructions: steps
          .map(
            (step, index) =>
              `${index + 1}. ${step}`
          )
          .join("\n"),

        cookingTime: cookingTime.trim(),
        servings: servings.trim(),
        calories: calories.trim(),
        difficulty: difficulty.trim(),

        category: "My Food",
        recipeCategory: "My Food",
      };

      if (isEditing) {
        // Find recipe being edited
        let index = recipes.findIndex(
          (item) =>
            String(item.idFood ?? item.recipeId ?? item.id) ===
            String(
              recipeToEdit.idFood ??
              recipeToEdit.recipeId ??
              recipeToEdit.id
            )
        );

        // Fallback for older recipes without IDs
        if (
          index === -1 &&
          Number.isInteger(recipeIndex)
        ) {
          index = recipeIndex;
        }

        if (index < 0 || index >= recipes.length) {
          throw new Error(
            "Recipe to edit was not found."
          );
        }

        recipes[index] = {
          ...recipes[index],
          ...newRecipe,
        };
      } else {
        // Add new recipe
        recipes.push(newRecipe);
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(recipes)
      );

      if (typeof onrecipeEdited === "function") {
        onrecipeEdited();
      }

      // Return to My Recipes
      navigation.goBack();
    } catch (err) {
      console.error("Error saving recipe:", err);

      setError(
        err.message || "Could not save recipe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>
          {isEditing
            ? "Edit Recipe"
            : "Add New Recipe"}
        </Text>

        <Text style={styles.subtitle}>
          Create your own delicious recipe
        </Text>

        {/* Title */}
        <Text style={styles.label}>
          Recipe Title *
        </Text>

        <TextInput
          placeholder="e.g. Homemade Pizza"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* Image */}
        <Text style={styles.label}>
          Recipe Image
        </Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickImage}
        >
          <Text style={styles.uploadButtonText}>
            📷 Choose Image
          </Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Select a photo or paste an image URL below.
        </Text>

        <TextInput
          placeholder="Image URL (optional)"
          placeholderTextColor="#9CA3AF"
          value={
            image.startsWith("data:")
              ? ""
              : image
          }
          onChangeText={setImage}
          style={styles.input}
          autoCapitalize="none"
        />

        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              No image selected
            </Text>
          </View>
        )}

        {/* Ingredients */}
        <Text style={styles.label}>
          Ingredients *
        </Text>

        <Text style={styles.helperText}>
          One ingredient per line.
          Use: Ingredient | Amount
        </Text>

        <TextInput
          placeholder={
            "Flour | 250 g\nEggs | 2\nMilk | 200 ml"
          }
          placeholderTextColor="#9CA3AF"
          value={ingredientsText}
          onChangeText={setIngredientsText}
          style={[styles.input, styles.largeInput]}
          multiline
          textAlignVertical="top"
        />

        {/* Instructions */}
        <Text style={styles.label}>
          Step-by-Step Instructions *
        </Text>

        <Text style={styles.helperText}>
          Write each cooking step on a new line.
        </Text>

        <TextInput
          placeholder={
            "Mix all ingredients\nHeat the oven to 180°C\nBake for 25 minutes"
          }
          placeholderTextColor="#9CA3AF"
          value={instructionsText}
          onChangeText={setInstructionsText}
          style={[styles.input, styles.largeInput]}
          multiline
          textAlignVertical="top"
        />

        {/* Description */}
        <Text style={styles.label}>
          Description (optional)
        </Text>

        <TextInput
          placeholder="Describe your recipe..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.mediumInput]}
          multiline
          textAlignVertical="top"
        />

        {/* Additional information */}
        <Text style={styles.sectionTitle}>
          Additional Information
        </Text>

        <Text style={styles.label}>
          Cooking Time (minutes)
        </Text>

        <TextInput
          placeholder="e.g. 30"
          placeholderTextColor="#9CA3AF"
          value={cookingTime}
          onChangeText={setCookingTime}
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Servings
        </Text>

        <TextInput
          placeholder="e.g. 4"
          placeholderTextColor="#9CA3AF"
          value={servings}
          onChangeText={setServings}
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Calories (kcal)
        </Text>

        <TextInput
          placeholder="e.g. 350"
          placeholderTextColor="#9CA3AF"
          value={calories}
          onChangeText={setCalories}
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Difficulty
        </Text>

        <TextInput
          placeholder="Easy / Medium / Hard"
          placeholderTextColor="#9CA3AF"
          value={difficulty}
          onChangeText={setDifficulty}
          style={styles.input}
        />

        {/* Error */}
        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        {/* Save button */}
        <TouchableOpacity
          onPress={saveRecipe}
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          disabled={saving}
          accessibilityRole="button"
          testID="saveRecipeButton"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing
                ? "Update Recipe"
                : "Save Recipe"}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 60,
  },

  form: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 15,
  },

  backButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 14,
  },

  helperText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
  },

  mediumInput: {
    minHeight: 90,
  },

  largeInput: {
    minHeight: 140,
  },

  uploadButton: {
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  uploadButtonText: {
    color: "#B45309",
    fontSize: 16,
    fontWeight: "bold",
  },

  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  placeholderText: {
    color: "#9CA3AF",
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 25,
    marginBottom: 12,
  },

  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginTop: 15,
    marginBottom: 10,
  },

  saveButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 26,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
