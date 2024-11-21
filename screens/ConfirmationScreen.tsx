import { styles } from './ConfirmationScreen.styles'
import React from 'react';
import { View, Button } from 'react-native';

export default function ConfirmationScreen({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="View Events"
          onPress={() => navigation.navigate('FeedScreen')}
        />
      </View>
      
      <Button
        title="Home"
        onPress={() => navigation.navigate('HomeScreen')}
      />
    </View>
  );
}
