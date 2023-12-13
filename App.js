import { Toasts } from '@backpackapp-io/react-native-toast';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useLocation } from './useLocation';

export default function App() {
  const {
    trackingStatus,
    startTracking,
    pauseTracking,
    stopTracking,
    markers,
    userLocation,
    setUserLocation,
    mapRef,
    zoomIn,
    zoomOut,
    zoom,
    MIN_ZOOM_LEVEL,
    MAX_ZOOM_LEVEL,
    isAnimating,
    setIsAnimating,
  } = useLocation();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={userLocation}
              onRegionChangeComplete={setUserLocation}
              zoomControlEnabled
              zoomEnabled
              showsUserLocation
              followsUserLocation
              loadingEnabled
              provider={PROVIDER_GOOGLE}
            >
              {markers.map(marker => (
                <Marker
                  key={marker.id}
                  tracksViewChanges={false}
                  coordinate={marker.coordinate}
                  title={marker.title}
                />
              ))}
            </MapView>

            <View style={styles.zoomButtons}>
              <TouchableOpacity
                onPress={zoomIn}
                disabled={zoom === MAX_ZOOM_LEVEL}
                style={styles.iconButton}
              >
                <Ionicons
                  name="add"
                  size={28}
                  style={{ opacity: zoom === MAX_ZOOM_LEVEL ? 0.2 : 1 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={zoomOut}
                disabled={zoom === MIN_ZOOM_LEVEL}
                style={styles.iconButton}
              >
                <Ionicons
                  name="remove"
                  size={28}
                  style={{ opacity: zoom === MIN_ZOOM_LEVEL ? 0.2 : 1 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.trackButtons}>
            <View style={styles.iconButton}>
              <Ionicons
                onPress={trackingStatus ? null : startTracking}
                name='play-outline'
                size={28}
                color={isAnimating === "play" ? "green" : "gray"}
              />
            </View>

            <View style={styles.iconButton}>
              <Ionicons
                onPress={!trackingStatus ? null : pauseTracking}
                name='pause-outline'
                size={28}
                color={isAnimating === "pause" ? "orange" : "gray"}
              />
            </View>

            <View style={styles.iconButton}>
              <Ionicons
                onPress={!trackingStatus ? null : stopTracking}
                name='stop-outline'
                size={28}
                color={isAnimating === "stop" ? "red" : "gray"}
              />
            </View>
          </View>

          <Toasts />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  trackButtons: {
    // padding: 16,
    position: 'absolute',
    bottom: 50,
    left: 16,
    gap: 8,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  iconButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
});
