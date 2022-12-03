import { View, Text } from 'react-native'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNotifications } from './useNotifications';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

const config = {
    androidClientId: '1087200411513-qdrl3of2v1eaakfbje7ffr7p9bkm5vd7.apps.googleusercontent.com',
    iosClientId: '1087200411513-t6evm7eah8mbefi60q22tauoqi72bah4.apps.googleusercontent.com',
    expoClientId: '1087200411513-6l2mt4m60qe8v7mc7ni625k7aop94okh.apps.googleusercontent.com',
    scopes: ["profile", "email"],
    permission: ["public_profile", "email", "gender", "location"],
}

export const AuthProvider = ({ children }) => {

    const [accessToken, setAccessToken] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pushToken, setPushToken] = useState(null);

    const [request, response, signInWithGoogle] = Google.useAuthRequest(config);
    //const [request, response, signInWithGoogle] = Google.useIdTokenAuthRequest(config);
    const { registerForPushNotificationsAsync } = useNotifications();

    useEffect(() => {
        if (response?.type === "success") {
            setAccessToken(response?.authentication.accessToken);
            setIdToken(response?.authentication.idToken);
            //setIdToken(response?.params.id_token);
            accessToken && firebaseSingIn();
        }
        if (response?.type === "error") {
            setError(response?.error);
        }
        setLoading(false);
    }, [response, accessToken])

    useEffect(() =>
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }

            setLoadingInitial(false);
        })
        , [])

    async function firebaseSingIn() {
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        //console.log(credential)
        await signInWithCredential(auth, credential);
        //console.log(signInResult)
        // set addPushTokenListener
        await registerForPushNotificationsAsync().then((response) => {
            setPushToken(response);
            //console.log(response);
        });
    }

    const logInClick = () => {
        setLoading(true);
    }

    const logout = () => {
        setLoading(true);

        signOut(auth)
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }

    const memoValue = useMemo(() => ({
        user,
        loading,
        error,
        pushToken,
        signInWithGoogle,
        logInClick,
        logout
    }), [user,
        loading,
        error,
        pushToken,])

    //console.log(response);
    //console.log(idToken);
    //console.log(loading);
    //console.log(user);
    //console.log(pushToken);

    return (
        <AuthContext.Provider
            value={memoValue}
        >
            {!loadingInitial && children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext);
}