import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, SafeAreaView, View, TouchableOpacity, ActivityIndicator, Text, Animated } from 'react-native';
import { styles } from './CameraScanner.styles';
import { Camera, CameraRuntimeError, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppStateListener } from '../../hooks/useAppStateListener';
import Icon from 'react-native-vector-icons/Ionicons';
import { ICameraScannerProps } from '../../types';

export const CameraScanner = ({ setIsCameraShown, onReadCode }: ICameraScannerProps) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const { appState } = useAppStateListener();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]); // Array to store scanned codes
  
  // Zoom functionality
  const [zoom, setZoom] = useState(0); // State for zoom level
  const zoomAnim = useRef(new Animated.Value(0)).current; // Animated value for zoom

  useEffect(() => {
    // Update the zoom value when zoomAnim changes
    zoomAnim.addListener(({ value }) => setZoom(value));

    return () => {
      zoomAnim.removeAllListeners(); // Clean up listeners on unmount
    };
  }, [zoomAnim]);

  const onInitialized = () => {
    setIsCameraInitialized(true);
    setIsActive(true); // Set active when initialized
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const newCode = codes[0].value;
        setScannedCodes(prev => {
          if (!prev.includes(newCode)) {
            return [...prev, newCode]; // Add new code to array if not already included
          }
          return prev; // Prevent duplicates
        });
        onReadCode(newCode); // Call the onReadCode function with the new code
        setIsActive(false); // Optionally deactivate after scan
      }
    },
  });
  
  

  const toggleFlash = () => {
    setFlash(prev => (prev === 'on' ? 'off' : 'on'));
  };

  const onError = (error: CameraRuntimeError) => {
    Alert.alert('Error!', error.message);
  };

  const handleZoomIn = () => {
    if (zoom < 1) {
      Animated.timing(zoomAnim, {
        toValue: Math.min(zoom + 0.1, 16), // Increase zoom by 0.1 but not exceed 1
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0) {
      Animated.timing(zoomAnim, {
        toValue: Math.max(zoom - 0.1, 0), // Decrease zoom by 0.1 but not go below 0
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  if (device == null) {
    Alert.alert('Error!', 'Camera could not be started');
    return null; // Ensure early return if the device is null
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        presentationStyle="fullScreen"
        animationType="slide"
        visible={true}
        onRequestClose={() => setIsCameraShown(false)}
      >
        {!isCameraInitialized && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Initializing Camera...</Text>
          </View>
        )}

        <Camera
          torch={flash}
          onInitialized={onInitialized}
          ref={camera}
          onError={onError}
          style={styles.fullScreenCamera}
          device={device}
          codeScanner={codeScanner}
          isActive={isActive && isFocused && appState === 'active' && isCameraInitialized}
          zoom={zoom} // Pass the zoom level here
        />

        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={() => setIsCameraShown(false)} style={styles.closeButton}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Icon name={flash === 'on' ? 'flash' : 'flash-off'} size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Text style={styles.zoomText}>Zoom In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Text style={styles.zoomText}>Zoom Out</Text>
          </TouchableOpacity>
        </View>

         {/* Display scanned codes with serial numbers */}
         {scannedCodes.length > 0 && (
          <View style={styles.codeDisplay}>
            {scannedCodes.map((code, index) => (
              <Text key={index} style={styles.codeText}>
                {index + 1}. {code} {/* Serial number followed by the code */}
              </Text>
            ))}
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};
