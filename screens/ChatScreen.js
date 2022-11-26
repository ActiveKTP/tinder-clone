import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import GlobalStyles from '../GlobalStyles';
import ChatList from '../components/ChatList';

const ChatScreen = () => {
    return (
        <SafeAreaView className="flex-1" style={GlobalStyles.droidSafeArea}>
            <Header title="Chat" callEnabled />
            <ChatList />
        </SafeAreaView>
    )
}

export default ChatScreen