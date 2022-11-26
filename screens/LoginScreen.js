import { View, Text, Button, ImageBackground, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const { signInWithGoogle, logout, logInClick, loading } = useAuth();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [])

    return (
        <View className='flex-1'>
            <ImageBackground
                resizeMode='cover'
                className='flex-1'
                source={require("../assets/tinder3.jpg")}
            >
                <TouchableOpacity
                    className='absolute bottom-40 w-52 bg-white p-4 rounded-2xl'
                    style={{ marginHorizontal: '25%' }}
                    onPress={() => { logInClick(), signInWithGoogle() }}
                >
                    <Text className='font-semibold text-center'>Sign in & get swiping</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View >
    )
}

export default LoginScreen