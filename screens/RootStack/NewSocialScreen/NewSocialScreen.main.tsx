import React, { useState, useEffect } from "react";
import { Platform, View, Image, StyleSheet  } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";
import { getApp } from "firebase/app";
import { collection, doc } from "firebase/firestore";
import { getFirestore, addDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
      
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */

  const [title, setTitle] = useState(''); 
  const [location, setLocation] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [image, setImage] = useState<string | null>(null);

  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/


  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    console.warn("A date has been picked: ", selectedDate);
    hideDatePicker();
  };


  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  // const MyComponent = () => {
  //   const showSnackbar = () => {
  //     Snackbar.show({
  //       text: 'Error!',
  //       duration: Snackbar.LENGTH_SHORT,
  //     });
  //   };
  
  //   return (
  //     <View>
  //       <Button title="Show Snackbar" onPress={showSnackbar} />
  //     </View>
  //   );
  // };
  
  // export default MyComponent;

  const handleDismissSnackbar = () => setSnackbarVisible(false);


  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.

    // Otherwise, proceed onwards with uploading the image, and then the object.

    if (!title || !description || !date || !image || !location) {
      setSnackbarVisible(true);
      return;
    }

    try {

      // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!

      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.

      const converting = await fetch(image);
      const blob = await converting.blob();


      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.

      const db = getFirestore();
      const storage = getStorage(getApp());
      const storageRef = ref(storage, uuid() + ".jpg");
      const result = await uploadBytes(storageRef, blob);


      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.

      const downloadURL = await getDownloadURL(result.ref);

      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.

      const socialDoc: SocialModel = {
        eventName: title,
        eventDate: date.getTime(),
        eventLocation: location,
        eventDescription: description,
        eventImage: downloadURL,
      };

      await addDoc(collection(db, "socials"), socialDoc);
      
      // (4) If nothing threw an error, then go to confirmation screen (which is a screen you must implement).
      //     Otherwise, show an error.

      navigation.navigate("ConfirmationScreen");

    } catch (e) {
      console.log("Error while writing social:", e);
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        <TextInput
          label="Event Name"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
        />
        <Button onPress={showDatePicker}>
          {date ? date.toDateString() : "Pick a date"}
        </Button>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <Button onPress={pickImage}>
          {image ? "Change Image" : "Pick an Image"}
        </Button>
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
        <Button onPress={saveEvent} loading={loading}>
          Create Event
        </Button>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleDismissSnackbar}
          duration={3000}
        >
          Please fill out all the fields
        </Snackbar>
      </View>
    </>
  );
}