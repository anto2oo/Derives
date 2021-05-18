import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import styles from '../../App.css';

const PermissionsPage = ({ navigation }) => {
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  const askLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const askCameraPermission = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    setCameraPermission(status === 'granted');
  };

  /**
   * Get permissions during screen loading
   */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.getPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  /**
   * Navigate to the next screen if both permissions are granted
   */
  useEffect(() => {
    if (locationPermission && cameraPermission) {
      navigation.replace('WelcomeScreen');
    }
  }, [locationPermission, cameraPermission]);

  return (
    <View style={[styles.containerWelcomeScreens, { flexDirection: 'column', justifyContent: 'space-around' }]}>
      <Text style={styles.textTitleW}>Avant de commencer...</Text>
      <View style={styles.containerRow}>
        <View>
          <Ionicons name="location-outline" size={48} color="white" style={{ textAlign: 'center' }} />
          <Text style={[styles.textW, { textAlign: 'center' }]}>
            Nous avons besoin de votre position pour prendre en compte vos changements de vitesse
            et votre environnement.
          </Text>
          {(!locationPermission)
          && <Button title="Autoriser" onPress={askLocationPermission} />
          || <Button title="Autorisé" disabled />}
        </View>
      </View>
      <View style={styles.containerRow}>
        <View>
          <Ionicons name="camera-outline" size={48} color="white" style={{ textAlign: 'center' }} />
          <Text style={[styles.textW, { textAlign: 'center' }]}>
            Nous avons besoin de votre caméra pour vous montrer le monde qui vous entoure.
          </Text>
          {(!cameraPermission)
          && <Button title="Autoriser" onPress={askCameraPermission} />
          || <Button title="Autorisé" disabled />}
        </View>
      </View>

      <View>
        {locationPermission && cameraPermission
        && (
        <Button
          title="Continuer"
          onPress={() => {
            navigation.replace('WelcomeScreen');
          }}
        />
        )
        || <Button title="Continuer" disabled />}
      </View>
    </View>
  );
};

PermissionsPage.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default PermissionsPage;
