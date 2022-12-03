import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../hooks/useAuth'
import getMatchedUserInfo from '../lib/getMatchedUserInfo'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

const ChatRow = ({ matchDetails }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [matchedUserInfo, setMatchedUserInfo] = useState(null);
    const [lastMessage, setLastMessage] = useState('')

    useEffect(() => {
        setMatchedUserInfo(getMatchedUserInfo(matchDetails.users, user.uid))
    }, [matchDetails, user]);

    useEffect(() =>
        onSnapshot(
            query(
                collection(db, 'matches', matchDetails.id, 'message'),
                orderBy('timestamp', 'desc')
            ), snapshot => setLastMessage(snapshot.docs[0]?.data()?.message)
        )
        , [matchDetails, db])

    return (
        <TouchableOpacity
            style={styles.cardShadow}
            className="flex-row items-center py-3 px-5 bg-white mx-3 my-1 rounded-lg"
            onPress={() => navigation.navigate('Message', { matchDetails, userReceive: matchedUserInfo })}
        >
            <Image
                className="rounded-full h-16 w-16 mr-4"
                source={{ uri: matchedUserInfo?.photoURL }}
            />

            <View>
                <Text className="text-lg font-semibold">
                    {matchedUserInfo?.displayName}
                </Text>
                <Text>{lastMessage || "Say Hi!"}</Text>
            </View>

        </TouchableOpacity>
    )
}

export default ChatRow

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#FF5864",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    }
})