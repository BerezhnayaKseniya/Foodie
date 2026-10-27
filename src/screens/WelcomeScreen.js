
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const ring1padding = useSharedValue(0);
  const ring2padding = useSharedValue(0);

  const ring1Style = useAnimatedStyle(() => ({
    padding: ring1padding.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    padding: ring2padding.value,
  }));

  useEffect(() => {
    ring1padding.value = 0;
    ring2padding.value = 0;

    const timer1 = setTimeout(() => {
      ring1padding.value = withSpring(hp(5));
    }, 100);

    const timer2 = setTimeout(() => {
      ring2padding.value = withSpring(hp(5.5));
    }, 300);

    const navigationTimer = setTimeout(() => {
      navigation.replace("Home");
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(navigationTimer);
    };
  }, [navigation, ring1padding, ring2padding]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated logo rings */}
      <Animated.View style={[styles.ring, ring2Style]}>
        <Animated.View style={[styles.ring, ring1Style]}>
          <Image
            source={{
              uri: "https://cdn.pixabay.com/photo/2024/08/29/02/47/italian-9005494_1280.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      {/* Application title */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Foodie</Text>
        <Text style={styles.subtitle}>
          your food recipe app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBBF24",
  },

  ring: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: hp(20),
    height: hp(20),
  },

  textContainer: {
    alignItems: "center",
    marginTop: hp(2),
  },

  title: {
    fontSize: hp(7),
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 3,
  },

  subtitle: {
    fontSize: hp(2),
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 3,
    textAlign: "center",
  },
});
