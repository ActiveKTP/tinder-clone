import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import useAuth from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import ChatRow from './ChatRow';

const ChatList = () => {
    const [matches, setMatches] = useState([]);
    const { user } = useAuth();

    useLayoutEffect(() =>
        onSnapshot(
            query(
                collection(db, 'matches'),
                where('userMatched', 'array-contains', user.uid)
            ),
            (snapshot) =>
                setMatches(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                )
        )
        , [user])

    //console.log(matches)

    return matches.length > 0 ? (
        <FlatList
            className="h-full"
            data={matches}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ChatRow matchDetails={item} />}
        />
    ) : (
        <View className="p-5">
            <Text className="text-center text-lg">No matches at the moment</Text>
        </View>
    )
}

export default ChatList