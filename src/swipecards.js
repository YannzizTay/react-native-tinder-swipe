'use strict';

import React, { AppRegistry, StyleSheet, Text, View, Animated, Component, PanResponder, Image, TouchableHighlight} from 'react-native';
import clamp from 'clamp';
import Dimensions from 'Dimensions';

const Persons = [
  {name: 'Barrack Obama', image: 'https://pbs.twimg.com/profile_images/451007105391022080/iu1f7brY_400x400.png'},
  {name: 'Albert Einstein', image: 'http://www.deism.com/images/Einstein_laughing.jpeg'},
  {name: 'The Beast', image: 'http://vignette2.wikia.nocookie.net/marveldatabase/images/4/43/Henry_McCoy_(Earth-10005)_0002.jpg/revision/latest?cb=20091116202257'},
  {name: 'Me', image: 'https://avatars0.githubusercontent.com/u/1843898?v=3&s=460'}
]

// The card area expands to take up the space not used but the button area
var SWIPE_THRESHOLD = 120;

class SwipeCards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(1),
      nextCardOpacity: new Animated.Value(1),
      currentPerson: Persons[0],
      nextPerson: Persons[1],
      isUserDragging: false,
    }
  }

  _goToNextPerson() {
    let currentPersonIdx = Persons.indexOf(this.state.currentPerson);
    let newIdx = (currentPersonIdx + 1) > Persons.length - 1 ? 0 : (currentPersonIdx + 1);
    let nextPersonIdx = (newIdx + 1) > Persons.length - 1 ? 0 : (newIdx + 1)

    this.setState({
      currentPerson: Persons[newIdx],
      nextPerson: Persons[nextPersonIdx]
    });
  }

  componentDidMount() {
    this._animateEntrance();
  }

  _animateEntrance() {
    // Animated.timing(this.state.nextCardOpacity, {
    //          toValue: 1,
    //    }).start()
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
        this.state.isUserDragging = true;
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        console.log('release');
        this.state.isUserDragging = false;
        this.state.pan.flattenOffset();
        var velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.99
          }).start(this._resetState.bind(this))
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }

  _resetState() {
    this.state.pan.setValue({x: 0, y: 0});
    //this.state.enter.setValue(0);
    this._goToNextPerson();
    //this._animateEntrance();
  }

  handleNopePress() {
      let screenwidth = Dimensions.get('window').width;
      let panlength = screenwidth + 100

      Animated.timing(this.state.pan, {
            toValue: {x: -panlength, y: 0}
      }).start(this._resetState.bind(this))
  }

  handleYupPress() {
      let screenwidth = Dimensions.get('window').width;
      let panlength = screenwidth + 100

      Animated.timing(this.state.pan, {
            toValue: {x: panlength, y: 0}
      }).start(this._resetState.bind(this))
  }

  render() {
    let { pan, enter, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
    let scale = enter;

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}]};

    let yupOpacity = pan.x.interpolate({inputRange: [0, 150], outputRange: [0, 1]});
    let animatedYupStyles = {opacity: yupOpacity}

    let nopeOpacity = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0]});
    let animatedNopeStyles = {opacity: nopeOpacity}

    // the rendering here is quite tricky. it was tricky getting all three correct at the same time . . .

    // 1. the card should always appear on top when being dragged so needs to be rendered near the end 
    // (at least after the buttons)
    // 2. the layout should be responsive
    // 3. the buttons need to work ofc - we have to be careful about rendering a view on top of them

    return (
      <View style={styles.bodyContainer}>
        <View style={styles.responsiveContainer}>

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonContainer}>
              <TouchableHighlight style={[styles.button, styles.buttonNope]} onPress={() => {this.handleNopePress()}}>
                  <Text style={styles.nopeText}>Nein!</Text>
              </TouchableHighlight>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableHighlight style={[styles.button, styles.buttonYup]} onPress={() => {this.handleYupPress()}}>
                  <Text style={styles.yupText}>Love!</Text>
              </TouchableHighlight>
            </View>
          </View>

          <View style={styles.cardsContainer}>
            <Animated.View key={this.state.nextPerson.name} style={[styles.card]}>
              <Image source={{uri: this.state.nextPerson.image}} style={styles.cardImage}>
                <Animated.View style={[styles.cardImageTextContainer, styles.cardImageYupContainer]}>
                  <Text style={[styles.cardImageText, styles.cardImageYupText]}>LOVE</Text>
                </Animated.View>
                <Animated.View style={[styles.cardImageTextContainer, styles.cardImageNopeContainer]}>
                  <Text style={[styles.cardImageText, styles.cardImageNopeText]}>NEIN</Text>
                </Animated.View>
              </Image>
              <View style={styles.cardLabelContainer}>
                <Text style={styles.name}>{this.state.nextPerson.name}</Text>
                <Text style={styles.value}>100$</Text>
              </View>
            </Animated.View>
            <Animated.View key={this.state.currentPerson.name} style={[styles.card, animatedCardStyles]} {...this._panResponder.panHandlers}>
              <Image source={{uri: this.state.currentPerson.image}} style={styles.cardImage}>
                <Animated.View style={[styles.cardImageTextContainer, styles.cardImageYupContainer, animatedYupStyles]}>
                  <Text style={[styles.cardImageText, styles.cardImageYupText]}>LOVE</Text>
                </Animated.View>
                <Animated.View style={[styles.cardImageTextContainer, styles.cardImageNopeContainer, animatedNopeStyles]}>
                  <Text style={[styles.cardImageText, styles.cardImageNopeText]}>NEIN</Text>
                </Animated.View>
              </Image>
              <View style={styles.cardLabelContainer}>
                <Text style={styles.name}>{this.state.currentPerson.name}</Text>
                <Text style={styles.value}>100$</Text>
              </View>
            </Animated.View>
          </View>

        </View>   
      </View>
    );
  }
}

var styles = StyleSheet.create({
  // main container
  bodyContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#F5FCFF',
  },

  // we keep the bottom button sections at height 100
  // the card expands to take up all the rest of the space
  responsiveContainer: {
    flex: 1,
    paddingBottom: 100,
  },

  // cards
  cardsContainer: {
    flex: 1,
  },

  card: {
    position: 'absolute',
    borderColor: '#AAA',
    borderWidth: 2,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0, 
    right: 0,
  },

  cardImage: {
    flex: 1,
    borderRadius: 4,
  },

  cardImageTextContainer: {
    position: 'absolute',
    borderWidth: 3,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 4,
    opacity: 0,
  },
  cardImageYupContainer : {
    top: 40,
    left: 40,
    transform:[{rotate: '-20deg'}],
    borderColor: 'green',
    
  },
  cardImageNopeContainer : {
    top: 40,
    right: 40,
    transform:[{rotate: '20deg'}],
    borderColor: 'red',
  },
  cardImageText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  cardImageNopeText: {
    color: 'red',
    backgroundColor: 'rgba(0,0,0,0)', 
  },
  cardImageYupText: {
    color: 'green',
    backgroundColor: 'rgba(0,0,0,0)',
  },

  cardLabelContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderColor: "#999",
    borderRadius: 4,
    borderBottomWidth: 2,
    padding: 8,
  },
  name: {
    fontWeight: 'bold',
    color: '#999',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#999',
  },
  
  // buttons

  buttonsContainer: {
    height:100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    borderWidth: 2,
    padding: 8,
    borderRadius: 5,
  },
  buttonNope: {
    borderColor: 'red',
  },
  buttonYup: {
    borderColor: 'green',
  },
  yupText: {
    fontSize: 20,
    color: 'green',
  },
  nopeText: {
    fontSize: 20,
    color: 'red',
  },

});


module.exports = SwipeCards