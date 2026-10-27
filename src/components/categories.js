
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Animated, {
  FadeInDown,
} from "react-native-reanimated";

export default function Categories({
  categories,
  activeCategory,
  handleChangeCategory,
}) {
  const navigation = useNavigation();

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        testID="categoriesScrollView"
      >
        {/* My Food */}
        <TouchableOpacity
          onPress={() => navigation.navigate("MyFood")}
          style={styles.categoryContainer}
          accessibilityRole="button"
          accessibilityLabel="My Food"
        >
          <View
            style={[
              styles.imageContainer,
              styles.myFoodButton,
            ]}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1926&auto=format&fit=crop",
              }}
              style={styles.categoryImage}
            />
          </View>

          <Text style={styles.categoryText}>
            My Food
          </Text>
        </TouchableOpacity>

        {/* My Favorites */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FavoriteScreen")
          }
          style={styles.categoryContainer}
          accessibilityRole="button"
          accessibilityLabel="My Favorites"
        >
          <View
            style={[
              styles.imageContainer,
              styles.myFoodButton,
            ]}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1463740839922-2d3b7e426a56?q=80&w=1900&auto=format&fit=crop",
              }}
              style={styles.categoryImage}
            />
          </View>

          <Text style={styles.categoryText}>
            My Favorites
          </Text>
        </TouchableOpacity>

        {/* Recipe Categories */}
        {categories.map((cat) => {
          const isActive =
            cat.strCategory === activeCategory;

          return (
            <TouchableOpacity
              key={cat.idCategory}
              onPress={() =>
                handleChangeCategory(cat.strCategory)
              }
              style={styles.categoryContainer}
              accessibilityRole="button"
              accessibilityLabel={cat.strCategory}
              accessibilityState={{
                selected: isActive,
              }}
            >
              <View
                style={[
                  styles.imageContainer,
                  isActive
                    ? styles.activeButton
                    : styles.inactiveButton,
                ]}
              >
                <Image
                  source={{
                    uri: cat.strCategoryThumb,
                  }}
                  style={styles.categoryImage}
                />
              </View>

              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {cat.strCategory}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 15,
    paddingVertical: hp(1),
    alignItems: "center",
  },


categoryContainer: {
  alignItems: "center",
  marginRight: 12,
  width: 96,
},


  imageContainer: {
    borderRadius: 9999,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#F59E0B",
  },

  inactiveButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },

  categoryImage: {
    width: hp(6),
    height: hp(6),
    borderRadius: 9999,
  },


categoryText: {
  fontSize: 13,
  color: "#52525B",
  marginTop: 6,
  textAlign: "center",
  flexWrap: "wrap",
},


  activeCategoryText: {
    color: "#F59E0B",
    fontWeight: "bold",
  },

  myFoodButton: {
    backgroundColor: "#4ADE80",
    borderRadius: 9999,
  },
});
