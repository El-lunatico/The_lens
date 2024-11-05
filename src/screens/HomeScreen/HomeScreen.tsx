import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { styles } from './HomeScreen.styles';
import { usePermissions } from '../../permissions';
import { EPermissionTypes } from '../../constants';
import { RESULTS } from 'react-native-permissions';
import { goToSettings } from '../../helpers';
import { CameraScanner } from '../../components';

export const HomeScreen = () => {
  const { askPermissions } = usePermissions(EPermissionTypes.CAMERA);
  const [cameraShown, setCameraShown] = useState(false);
  const [qrTexts, setQrTexts] = useState<string[]>([]); // Changed to an array to store multiple QR codes

  let items = [
    {
      id: 1,
      title: 'QR code Scanner',
    },
  ];

  const handleBackButtonClick = () => {
    if (cameraShown) {
      setCameraShown(false);
    }
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const takePermissions = async () => {
    askPermissions()
      .then(response => {
        if (response.type === RESULTS.LIMITED || response.type === RESULTS.GRANTED) {
          setCameraShown(true);
        }
      })
      .catch(error => {
        if ('isError' in error && error.isError) {
          Alert.alert(error.errorMessage || 'Something went wrong while taking camera permission');
        }
        if ('type' in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            Alert.alert('This feature is not supported on this device');
          } else if (error.type === RESULTS.BLOCKED || error.type === RESULTS.DENIED) {
            Alert.alert(
              'Permission Denied',
              'Please give permission from settings to continue using camera.',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                { text: 'Go To Settings', onPress: () => goToSettings() },
              ],
            );
          }
        }
      });
  };

  const handleReadCode = (value: string) => {
    setQrTexts(prev => [...prev, value]); // Add the new scanned QR code to the array
    setCameraShown(false);
  };

  return (
    <View style={styles.container}>
      {items.map(eachItem => {
        return (
          <TouchableOpacity
            onPress={takePermissions}
            activeOpacity={0.5}
            key={eachItem.id}
            style={styles.itemContainer}>
            <Text style={styles.itemText}>{eachItem.title}</Text>
          </TouchableOpacity>
        );
      })}
      {cameraShown && (
        <CameraScanner
          setIsCameraShown={setCameraShown}
          onReadCode={handleReadCode}
        />
      )}
      {qrTexts.length > 0 && (
        <View style={styles.qrResultContainer}>
          {qrTexts.map((qrText, index) => (
            <Text key={index} style={styles.qrResultText}>
              {index + 1}. Scanned QR Code: {qrText}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
