import React from 'react';
import { Button } from "react-native-paper";

function HomeScreen(props) {
    const navigation = props.navigation;
    return(
        <view>
            <text>Welcome to the MDB Socials App!</text>
            <Button
                title="View Socials"
                onPress = { () => navigation.navigate('FeedScreen')}
            />
            <Button
                title = "Create New Social"
                onPress = { () => navigation.navigate('NewSocialScreen')}
            />
        </view>
    )
}
