
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { useNavigation } from "@react-navigation/native";

export default function Recipe({ categories, foods }) {
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => (
    <ArticleCard
      item={item}
      index={index}
      navigation={navigation}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipes</Text>

      <View testID="recipesDisplay">
        <FlatList
          data={foods || []}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            String(item.idFood ?? item.recipeId ?? index)
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No recipes available in this category yet.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const ArticleCard = ({ item, index, navigation }) => {
  const description =
    item.cookingDescription ||
    item.recipeInstructions ||
    "";

  const handlePress = () => {
    navigation.navigate("RecipeDetail", item);
  };

  return (
    <View
      style={styles.cardContainer}
      testID="articleDisplay"
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`Open recipe ${item.recipeName}`}
      >
        {item.recipeImage ? (
          <Image
            source={{ uri: item.recipeImage }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.articleImage,
              styles.imagePlaceholder,
            ]}
          >
            <Text style={styles.placeholderText}>
              No image
            </Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            style={styles.articleText}
            numberOfLines={2}
          >
            {item.recipeName}
          </Text>

          <Text
            style={styles.categoryText}
            numberOfLines={1}
          >
            {item.recipeCategory || item.category}
          </Text>

          <Text
            style={styles.articleDescription}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },

  title: {
    fontSize: hp(3),
    fontWeight: "600",
    color: "#52525B",
    marginBottom: hp(1.5),
  },

  listContent: {
    paddingBottom: hp(2),
  },

  row: {
    justifyContent: "space-between",
  },

  cardContainer: {
    width: "48%",
    marginBottom: hp(2),
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: hp(1),
  },

  articleImage: {
    width: "100%",
    height: hp(19),
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },

  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#9CA3AF",
    fontSize: hp(1.5),
  },

  textContainer: {
    paddingHorizontal: wp(1),
    paddingTop: hp(1),
  },

  articleText: {
    fontSize: hp(1.8),
    fontWeight: "700",
    color: "#374151",
    marginBottom: hp(0.5),
  },

  categoryText: {
    fontSize: hp(1.4),
    fontWeight: "600",
    color: "#F59E0B",
    marginBottom: hp(0.5),
  },

  articleDescription: {
    fontSize: hp(1.35),
    color: "#6B7280",
    lineHeight: hp(2),
  },

  emptyContainer: {
    paddingVertical: hp(5),
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: hp(1.7),
    color: "#9CA3AF",
    textAlign: "center",
  },
});
