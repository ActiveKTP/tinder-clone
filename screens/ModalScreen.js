import { View, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import GlobalStyles from '../GlobalStyles';
import useAuth from '../hooks/useAuth';
import { doc, serverTimestamp, setDoc } from "@firebase/firestore";
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const ModalScreen = () => {
    const navigation = useNavigation();
    const { user, pushToken } = useAuth();
    const [image, setImage] = useState(null)
    const [job, setJob] = useState(null)
    const [age, setAge] = useState(null)

    const incompleteForm = !image || !job || !age;

    const updateUserProfile = () => {
        const userProfile = {
            id: user.uid,
            displayName: user.displayName,
            photoURL: image,
            job: job,
            age: age,
            pushToken: pushToken ? pushToken : "",
            timestamp: serverTimestamp()
        };
        console.log(userProfile)
        setDoc(doc(db, 'users', user.uid), userProfile)
            .then(() => {
                navigation.navigate("Home");
            })
            .catch((error) => {
                alert(error.message);
                console.log(error)
            })
    };

    return (
        <SafeAreaView
            className="flex-1 items-center pt-1"
            style={GlobalStyles.droidSafeArea}
        >
            <Image
                className="h-20 w-full"
                resizeMode="contain"
                source={require("../assets/tinder-logo2.png")}
            />

            <Text className="text-xl text-gray-500 p-4 font-bold bottom-2">Welcome {user.displayName}</Text>

            <Text className="text-center p-4 font-bold text-red-400">
                Step 1: The Profile Pic
            </Text>
            <TextInput
                value={image}
                onChangeText={setImage}
                className="text-center text-xl pb-2"
                placeholder="Enter a Profile Pic URL"
            />

            <Text className="text-center p-4 font-bold text-red-400">
                Step 2: The Job
            </Text>
            <TextInput
                value={job}
                onChangeText={setJob}
                className="text-center text-xl pb-2"
                placeholder="Enter your occupation"
            />

            <Text className="text-center p-4 font-bold text-red-400">
                Step 3: The Age
            </Text>
            <TextInput
                value={age}
                onChangeText={setAge}
                className="text-center text-xl pb-2"
                placeholder="Enter your age"
                keyboardType='numeric'
                maxLength={2}
            />

            <TouchableOpacity
                disabled={incompleteForm}
                className={`w-64 p-3 rounded-xl absolute bottom-10 ${incompleteForm ? "bg-gray-400" : "bg-red-400"}`}
                onPress={updateUserProfile}
            >
                <Text className="text-center text-white text-xl">Update Profile</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ModalScreen