import React, {useEffect, useState} from 'react'
import {Animated, Text, TouchableOpacity, View} from 'react-native';
import useInterval from "@use-it/interval";
import {Ionicons} from '@expo/vector-icons';
import CCamera from './CCamera';
import {styles} from "../../App.css";

import {sedacDataset, sedacLocationRequest} from "../Helpers/location.js";
import * as Location from "expo-location";
import {calculateMoment, calculateSeason} from '../Helpers/time';
import {weatherRequest} from "../Helpers/weather";
import {combine, fadeTo, getTextArray} from "../Helpers/text";
import {getAcceleration, getAmbiance, getMusic, getOneOff, play} from "../Helpers/sound";
import {useFonts} from "expo-font";

const TextGenerator = ({navigation}) => {

  // Page states
  const [isMounted, setIsMounted] = useState(true)
  const [debug, setDebug] = useState(false)

  //Localisation states 
  const [longitude, setLongitude] = useState()
  const [latitude, setLatitude] = useState()
  const [localityDensity, setLocalityDensity] = useState()
  const [localityType, setLocalityType] = useState(navigation.getParam('localityType'))
  const [season] = useState(calculateSeason())
  const [moment] = useState(navigation.getParam('moment', calculateMoment()))
  const [temperature, setTemperature] = useState(-100)
  const [weather, setWeather] = useState(navigation.getParam('weather'))

  //Music states
  const [isReadyToPlay, setIsReadyToPlay] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState([])
  const [shouldPlayAmbiance, setShouldPlayAmbiance] = useState(false)
  const [musicInterval, setMusicInterval] = useState()

  // Poems states
  const [vers, setVers] = useState()
  const [fontOpacity] = useState(new Animated.Value(0))
  const [index, setIndex] = useState(0);
  const [nbLines, setNbLines] = useState(4)
  const [fontSize] = useState(new Animated.Value(20))
  const [currentSpeed, setCurrentSpeed] = useState()
  const [speedIncreased, setSpeedIncreased] = useState(false)
  const [speedAverage, setSpeedAverage] = useState(null)
  const [previousSpeedAverage, setPreviousSpeedAverage] = useState(null)


  /**
   * Mise à jour de la position du téléphone
   * @param location
   */
  const updateLocation = (location) => {
    if (isMounted) {
      setLongitude(location.coords.longitude)
      setLatitude(location.coords.latitude)
      setCurrentSpeed(location.coords.speed)
    }
  }

  useEffect(() => {
    if (!currentSpeed || currentSpeed === -1) return
    setSpeedAverage((speedAverage)
      ? (speedAverage + currentSpeed) / 2
      : currentSpeed)
  }, [currentSpeed])

  /**
   * Mise à jour du type d'environnement lorsque la densité de pop change
   */
  useEffect(() => {
    if (isMounted && localityType === undefined) {
      setLocalityType(localityDensity < 250 ? 'country' : 'city')
    }
  }, [localityDensity])

  /**
   * Lance la lecture de la musique
   */
  useEffect(() => {
    if (!isReadyToPlay) return

    // On commence par démarrer la musique
    let musicFile = getMusic(moment)
    play(musicFile).then((sound) => {
      setCurrentlyPlaying(currentlyPlaying.concat([sound]))
    })

    // Si la musique choisie permet d'ajouter un son d'ambiance, on le fait
    if (musicFile !== "../data/Musics/noon3.mp3") setShouldPlayAmbiance(true)

  }, [isReadyToPlay])

  /**
   * Lance la lecture d'un son d'ambiance
   */
  useEffect(() => {
    if (!shouldPlayAmbiance) return
    let ambianceFile = getAmbiance(localityType)
    play(ambianceFile).then((sound) => {
      setCurrentlyPlaying(currentlyPlaying.concat([sound]))
    })
  }, [shouldPlayAmbiance])

  /**
   * Lance la lecture des sons ponctuels
   */
  useEffect(() => {
    // La musique 3 n'admet pas non plus de son ponctuels
    if (!shouldPlayAmbiance) return
    let oneOffFile = getOneOff(moment, vers)
    if (oneOffFile) play(oneOffFile)
  }, [vers])

  /**
   * Joue les sons lorsque l'accélération change
   */
  useEffect(() => {
    // On supprime l'intervalle précédent
    if (musicInterval) clearInterval(musicInterval)

    // On en crée un nouveau en fonction de l'accélération actuelle
    if (speedIncreased) {
      setMusicInterval(setInterval(() => {
        play(getAcceleration())
      }, 1500))
    } else {
      setMusicInterval(setInterval(() => {
        play(getAcceleration())
      }, 4000))
    }

  }, [speedIncreased])

  /**
   * componentDidMount()
   * Démarrage de toutes les requêtes API
   * Lancé une seule fois au démarrage
   */
  useEffect(() => {
    setIsMounted(true);

    Location.getCurrentPositionAsync().then((location) => {
      // Mise à jour de la position
      updateLocation(location)

      // Récupération des données météo
      weatherRequest(location.coords.latitude, location.coords.longitude)
        .then(response => {
          if (isMounted) {
            setTemperature(response.data.main.temp)
            // Inférer un état de la température
            if (temperature < 12) {
              setWeather("cold")
            } else if (temperature > 25) {
              setWeather("hot")
            } else {
              setWeather("sweet")
            }
          }
        })

      // Récupération des données de densité de pop
      sedacLocationRequest(location.coords.latitude, location.coords.longitude)
        .then(response => {
          if (isMounted && response.data.results[0]) {
            setLocalityDensity(response.data.results[0].value.estimates[sedacDataset].MEAN)
          }
        })
    })

    // On update la position GPS en direct
    let locationWatcher = Location.watchPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 1,
      timeInterval: 1000,
    }, updateLocation);

    return () => {
      setIsMounted(false)
      locationWatcher.then(subscriber => {
        subscriber.remove()
      })
      // TODO : ne marche pas
      currentlyPlaying.forEach((sound) => {
        sound.unloadAsync()
      })
    }

  }, [])

  useEffect(() => {
    if (moment === "nuit") setVers("Dérive de la  " + moment)
    else setVers("Dérive du " + moment)
    setTimeout(() => {
      setVers("Commencez à marcher")
    }, 5000)
  }, [moment])

  useEffect(() => {
    fontOpacity.setValue(0)
    fadeTo(fontOpacity, 1)
  }, [vers])

  useInterval(() => {
    if (!isMounted || !localityType || !weather || !season || !moment || !currentSpeed || !localityDensity) return

    if (!isReadyToPlay) setIsReadyToPlay(true)

    let text = getTextArray('matin')
    let speedIncreased = speedAverage > previousSpeedAverage;
    setSpeedIncreased(speedIncreased)
    let relevantText = speedIncreased ? text.acceleration : text.stable

    // On réinitialise les moyennes de vitesse
    setPreviousSpeedAverage(speedAverage)
    setSpeedAverage(null)

    // Si on est arrivé à la fin du texte, on boucle
    if (relevantText.length < index + nbLines) {
      navigation.replace('Sas')
      return;
    }

    // Sinon, on génère le nouveau vers
    // Pour chaque ligne (dépend de la vitesse)
    let vers = ""

    for (let i = index; i < index + nbLines; i++) {
      // On récupère une partie du texte et on la fait varier avec interpretText
      vers += "\n" + combine(relevantText[i], localityType, weather)
    }
    setIndex(index + nbLines)
    setVers(vers)

    if (speedIncreased) {
      fadeTo(fontSize, 30 * Math.max(Math.min(3, (currentSpeed ?? 0) / 2), 1), 1000, false)
      setNbLines(Math.max(nbLines - 1, 2))
    } else {
      fadeTo(fontSize, 15 * Math.max(Math.min(3, (currentSpeed ?? 0) / 2), 1), 1000, false)
      setNbLines(Math.min(nbLines + 1, 4))
    }

  }, 12000)
  
  return (
    <View style={styles.mainContainerCamera}>
      <View style={styles.cameraContainer}>
        <CCamera/>
      </View>
      <View style={styles.textContainer}>
        <TouchableOpacity onLongPress={() => {
          setDebug(!debug)
        }}>
          <Animated.View style={{opacity: fontOpacity}}>
            <Animated.Text style={[styles.textOver, {fontSize: fontSize}]}>
              {vers}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      {debug &&
      <View style={styles.containerCaptors}>
        <Text style={styles.textCaptors}> Saison : {season}  </Text>
        <Text style={styles.textCaptors}> Moment : {moment}  </Text>
        <Text style={styles.textCaptors}> Vitesse : {currentSpeed}</Text>
        <Text style={styles.textCaptors}> Vit. moyenne / Ancienne Vit.
          : {speedAverage} / {previousSpeedAverage}  </Text>
        <Text style={styles.textCaptors}> Accélération : {speedIncreased ? 'Oui' : 'Non'}  </Text>
        <Text style={styles.textCaptors}> Lat / Lon : {latitude.toFixed(5)} / {longitude.toFixed(5)}  </Text>
        <Text style={styles.textCaptors}> Densité de pop : {localityDensity} </Text>
        <Text style={styles.textCaptors}> Milieu : {localityType}</Text>
        <Text style={styles.textCaptors}> Météo : {weather} </Text>
        <Text style={styles.textCaptors}> Temperature : {temperature}</Text>
        <Text style={styles.textCaptors}> Nb Lines : {nbLines}</Text>

      </View>
      }
      {/* Back button */}
      <TouchableOpacity
        style={{flex: 1, position: 'absolute', bottom: 0, left: 0, marginBottom: 5, marginLeft: 5}}
        onPress={() => navigation.navigate('ChooseParams')}>
        <Ionicons name="md-arrow-back-circle-outline" size={32} color="darkgrey"/>
      </TouchableOpacity>
      {/* Debug button */}
      <TouchableOpacity
        style={{flex: 1, position: 'absolute', bottom: 0, right: 0, marginBottom: 5, marginRight: 5}}
        onPress={() => setDebug(!debug)}>
        <Ionicons name="md-information-circle-outline" size={32} color="darkgrey"/>
      </TouchableOpacity>
    </View>
  )
}


export default TextGenerator
