import { View, Text, SafeAreaView, Button, TouchableOpacity, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { ThemeProvider, useNavigation } from '@react-navigation/native';
import GlobalStyles from '../GlobalStyles';
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons"
import Swiper from 'react-native-deck-swiper';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import generateId from '../lib/generateId';

const DUMMY_DATA = [
    {
        id: "123",
        firstName: "Activex",
        lastName: "Franky",
        occupation: "Software Developer",
        photoURL: "https://media-exp1.licdn.com/dms/image/C4E03AQGvLA7Vjfpxrw/profile-displayphoto-shrink_200_200/0/1609252888574?e=1674691200&v=beta&t=4JItTSItBo2cSncEnXo7Mg07QIEjMIGK8SUQ2V18vG0",
        age: 40
    },
    {

        id: "456",
        firstName: "Elon",
        lastName: "Musk",
        occupation: "Software Developer",
        photoURL: "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cg_face%2Cq_auto:good%2Cw_300/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
        age: 40
    },
    {
        id: "789",
        firstName: "Wonyoung",
        lastName: "June",
        occupation: "Koren Girl Group",
        photoURL: "https://img.soccersuck.com/images/2022/11/20/c1a165a677564f89a85d0044861f9892_316096907_517080940364015_1353467868769186016_n.jpg",
        age: 23
    },
    {

        id: "147",
        firstName: "Sakura",
        lastName: "LE",
        occupation: "Japan idol",
        photoURL: "https://img.soccersuck.com/images/2022/11/20/9d6a41fab4b348549e1b994c02831faf_316163770_191699106685095_6017206165223053385_n.jpg",
        age: 25
    },
];

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [profiles, setProfiles] = useState([])
    const swipeRef = useRef(null);

    useLayoutEffect(() =>
        onSnapshot(doc(db, "users", user.uid), (snapshot) => {
            if (!snapshot.exists()) {
                navigation.navigate("Modal")
            }
        })
        , [])

    useEffect(() => {
        let unsub;

        const fetchCards = async () => {

            const passes = await getDocs(collection(db, 'users', user.uid, 'passes'))
                .then((snapshot) => snapshot.docs.map((doc) => doc.id));

            const swipes = await getDocs(collection(db, 'users', user.uid, 'swipes'))
                .then((snapshot) => snapshot.docs.map((doc) => doc.id));

            const passedUserIds = passes.length > 0 ? passes : ['test'];
            const swipedUserIds = swipes.length > 0 ? swipes : ['test'];

            unsub = onSnapshot(
                query(collection(db, "users"),
                    where('id', 'not-in', [...passedUserIds, ...swipedUserIds])
                ),
                (snapshot) => {
                    setProfiles(
                        snapshot.docs
                            .filter((doc) => doc.id !== user.uid)
                            .map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                            }))
                    )
                })
        }

        fetchCards();
        return unsub;
    }, [db])

    //console.log(profiles)

    const swipeLeft = async (cardIndex) => {
        if (!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        console.log(`You swiped PASS on ${userSwiped.displayName}`);

        setDoc(doc(db, 'users', user.uid, 'passes', userSwiped.id), userSwiped)
    }

    const swipeRight = async (cardIndex) => {
        if (!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        const loggedInProfile = await (await getDoc(doc(db, 'users', user.uid))).data();

        // Check if the user swiped on you ...
        getDoc(doc(db, 'users', userSwiped.id, 'swipes', user.uid)).then(
            (documentSnapshot) => {
                if (documentSnapshot.exists()) {
                    // user has matched with you before you matched with them...
                    console.log(`Hooray, You Matched with ${userSwiped.displayName}`);

                    // Create Match
                    setDoc(doc(db, 'matches', generateId(user.uid, userSwiped.id)), {
                        users: {
                            [user.uid]: loggedInProfile,
                            [userSwiped.id]: userSwiped,
                        },
                        userMatched: [user.uid, userSwiped.id],
                        timestamp: serverTimestamp(),
                    })
                    navigation.navigate('Match', {
                        loggedInProfile,
                        userSwiped,
                    })
                }
                else {
                    // User has swiped as first interaction between the TouchableWithoutFeedback...
                    console.log(`You swiped on ${userSwiped.displayName}`);

                }
            }
        );
        setDoc(doc(db, 'users', user.uid, 'swipes', userSwiped.id), userSwiped)
    }

    return (
        <SafeAreaView className="flex-1" style={GlobalStyles.droidSafeArea}>
            {/* Header */}
            <View className="flex-row items-center justify-between relative px-5">
                <TouchableOpacity
                    onPress={logout}
                >
                    <Image
                        className="h-10 w-10 rounded-full"
                        source={{ uri: user.photoURL }}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
                    <Image className="h-14 w-14" source={require("../assets/tinder-logo.png")} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
                    <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
                </TouchableOpacity>
            </View>

            {/* Card */}
            <View className="flex-1 -mt-6">
                <Swiper
                    ref={swipeRef}
                    containerStyle={{ backgroundColor: "transparent" }}
                    cards={profiles}
                    stackSize={5}
                    cardIndex={0}
                    animateCardOpacity
                    verticalSwipe={false}
                    onSwipedLeft={(cardIndex) => {
                        swipeLeft(cardIndex);
                    }}
                    onSwipedRight={(cardIndex) => {
                        swipeRight(cardIndex);
                    }}
                    backgroundColor="#4DED30"
                    overlayLabels={{
                        left: {
                            title: "NOPE",
                            style: {
                                label: {
                                    textAlign: "right",
                                    color: "red"
                                },
                            },
                        },
                        right: {
                            title: "MATCH",
                            style: {
                                label: {
                                    color: "#4DED30"
                                },
                            },
                        }
                    }}
                    renderCard={(card) => card ? (
                        <View key={card.id} className="relative bg-white h-3/4 rounded-xl">
                            <Image
                                className="absolute top-0 h-full w-full rounded-xl"
                                source={{ uri: card.photoURL }}
                            />
                            <View
                                className="flex-row absolute justify-between 
                            items-center bottom-0 bg-white 
                            w-full h-20 px-6 py-2 rounded-b-xl"
                                style={styles.cardShadow}
                            >
                                <View>
                                    <Text className="text-xl font-bold">{card.displayName}</Text>
                                    <Text>{card.job}</Text>
                                </View>
                                <Text className="text-2xl font-bold">{card.age}</Text>
                            </View>
                        </View>
                    ) : (
                        <View
                            className="relative bg-white h-3/4 rounded-xl justify-center items-center"
                            style={styles.cardShadow}
                        >
                            <Image
                                className="h-20 w-20"
                                height={24}
                                width={24}
                                source={{ uri: "https://links.papareact.com/6gb" }}
                            />
                        </View>
                    )}
                />
            </View>

            <View className="flex flex-row justify-evenly bottom-4">
                <TouchableOpacity
                    onPress={() => swipeRef.current.swipeLeft()}
                    className="items-center justify-center rounded-full w-16 h-16 bg-red-200"
                >
                    <Entypo name='cross' size={24} color='red' />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => swipeRef.current.swipeRight()}
                    className="items-center justify-center rounded-full w-16 h-16 bg-green-200">
                    <AntDesign name='heart' size={24} color='green' />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default HomeScreen

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