import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import FormInput from "../../../components/PersonalInfo/FormInput";
import Button from "../../../components/PersonalInfo/Button";
import theme from "../../../constants/Theme";
import { useNavigation } from "expo-router";

// --- Types ---
type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
};

type Errors = Partial<Record<keyof UserData, string>>;

type UserEditScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: any; // You can type route.params properly if you pass params
};

const UserEditScreen: React.FC<UserEditScreenProps> = () => {

  const navigation = useNavigation();

  const [userData, setUserData] = useState<UserData>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!userData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!userData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!userData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Saving user data:", userData);
      alert("Profile updated successfully!");
      navigation.goBack();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(
        "Sorry, we need camera roll permissions to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUserData((prev) => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.palette.neutral.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
            <Ionicons
              name="camera"
              size={20}
              color={theme.palette.neutral.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <FormInput
            label="First Name"
            value={userData.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
            placeholder="Enter your first name"
            error={errors.firstName}
          />
          <FormInput
            label="Last Name"
            value={userData.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
            placeholder="Enter your last name"
            error={errors.lastName}
          />
          <FormInput
            label="Email"
            value={userData.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <FormInput
            label="Phone Number"
            value={userData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <FormInput
            label="Address"
            value={userData.address}
            onChangeText={(text) => handleChange("address", text)}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
            error={errors.address}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === "ios" ? 50 : theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.palette.neutral.white,
    ...theme.shadows.md,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: theme.palette.secondary.main,
    borderRadius: theme.borderRadius.pill,
    padding: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    ...theme.shadows.md,
  },
  saveButton: {
    backgroundColor: theme.palette.secondary.main,
  },
});

export default UserEditScreen;
