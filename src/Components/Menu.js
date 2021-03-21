import React, {useState, useEffect} from 'react'
import { Text, View, StyleSheet, TouchableOpacity} from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Menu = ({navigation}) => {
  const [moment, setMoment] = useState()
  const [localityType, setLocalityType] = useState()
  const [weather, setWeather] = useState()

  let momentItems = [
    {label: 'Matin', value: 'matin'},
    {label: 'Midi', value: 'midi'},
    {label: 'Soir', value: 'soir'},
    {label: 'Nuit', value: 'nuit'},
  ]

  let localityItems = [
    {label: 'Rural', value: 'country'},
    {label: 'Ville', value: 'city'},
  ]

  let weatherItems = [
    {label: 'Froid', value: 'cold'},
    {label: 'Tempéré', value: 'sweet'},
    {label: 'Chaud', value: 'hot'}
  ]

  return (
    <>
    <View style= {styles.flexContainer}>
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Texte')}
          style={styles.buttonStyle}>
          <Text style = {styles.textStyle}>Mode immersif</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          style={styles.buttonStyle}>
          <Text style = {styles.textStyle}>Choisir les paramètres</Text>
          <DropDownPicker zIndex={5000}
          items={momentItems}
          defaultValue={moment}
          containerStyle={{height: 40}}
          placeholder= "Choisissez un moment de la journée"
          itemStyle={{
              justifyContent: 'flex-start'
          }}
          dropDownStyle={{backgroundColor: '#fafafa'}}
          onChangeItem={item => setMoment(item.value)}
          />
          <DropDownPicker zIndex={4000}
                          items={localityItems}
                          defaultValue={localityType}
                          placeholder= "Choisissez le milieu"
                          containerStyle={{height: 40, marginTop: 10}}
                          itemStyle={{
                            justifyContent: 'flex-start'
                          }}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setLocalityType(item.value)}
          />
          <DropDownPicker zIndex={3000}
                          items={weatherItems}
                          defaultValue={weather}
                          placeholder= "Choisissez la météo"
                          containerStyle={{height: 40, marginTop: 10}}
                          itemStyle={{
                            justifyContent: 'flex-start'
                          }}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setWeather(item.value)}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Texte', {
            moment: moment,
            localityType: localityType,
            weather: weather}
          )} >
            <Text style = {styles.textStyle}>Commencer l'expérience</Text>
          </TouchableOpacity>
          </TouchableOpacity>
        </View>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 28,
    textAlign: "center",
    padding: 10,
  },
  buttonStyle: {
    paddingTop:20,
    paddingLeft:20,
    paddingRight:20,
    paddingBottom:20,
    textAlign:'center',
    backgroundColor:'#b6ddf7',
    borderRadius: 10,
    borderWidth: 1,
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    alignItems:'center',
    padding: 10,
    backgroundColor: '#FFE7EE'
  }
})

export default Menu