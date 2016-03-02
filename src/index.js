/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Header from './header';
import SwipeCards from './swipecards';

function Init() {

  class ReactNativeTinderSwipe extends Component {
    render() {
      return (
        <View style={styles.container}>
          <View style={styles.container}>
              <Header/>
              <SwipeCards/>
            </View>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      marginTop: 24,
      flex: 1,
    },
  });

  AppRegistry.registerComponent('ReactNativeTinderSwipe', () => ReactNativeTinderSwipe);
}

module.exports = Init
