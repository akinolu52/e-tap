import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from './useLocation';

export default function App() {
  const {
    trackingStatus,
    startTracking,
    markers,
    stopTracking,
    userLocation,
    setUserLocation,
    mapRef,
    zoomIn,
    zoomOut,
    zoom,
    MIN_ZOOM_LEVEL,
    MAX_ZOOM_LEVEL,
  } = useLocation();

  // console.log('userLocation: ', userLocation);

  return (
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
            style={styles.zoomButton}
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
            style={styles.zoomButton}
          >
            <Ionicons
              name="remove"
              size={28}
              style={{ opacity: zoom === MIN_ZOOM_LEVEL ? 0.2 : 1 }}
            />
          </TouchableOpacity>
          {/* <Button title="Zoom In" onPress={zoomIn} />
          <Button title="Zoom Out" onPress={zoomOut} /> */}
        </View>
      </View>

      <View style={styles.trackButtons}>
        <Text>Tracking Status: {trackingStatus ? 'Tracking' : 'Not Tracking'}</Text>

        <TouchableOpacity onPress={!trackingStatus ? startTracking : stopTracking}>
          {!trackingStatus ?
            <Ionicons name='play-outline' size={32} color={trackingStatus ? "green" : "black"} />
            :
            <Ionicons name='pause-outline' size={32} color={!trackingStatus ? "red" : "black"} />
          }
        </TouchableOpacity>
      </View>

      {/* <Button title="Start Tracking"  disabled={trackingStatus} />
        <Button title="Stop Tracking" onPress={} disabled={!trackingStatus} /> */}
    </View>
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
    backgroundColor: 'white',
    bottom: 50,
    left: 16,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'red',
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc'
  }
});
