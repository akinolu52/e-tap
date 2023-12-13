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
        {/* {userLocation && ( */}
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
              draggable
              tracksViewChanges={false}
              coordinate={marker.coordinate}
              title={marker.title}
              onDragEnd={(e) => {
                console.log(e.nativeEvent.coordinate, e)
                // this.setState({
                //   lastLat: e.nativeEvent.coordinate.latitude,
                //   lastLong: e.nativeEvent.coordinate.longitude,
                // })
              }}
            />
          ))}
        </MapView>
        {/* )} */}

        <View style={styles.zoomButtons}>
          <TouchableOpacity
            onPress={zoomIn}
            disabled={zoom === MAX_ZOOM_LEVEL}
          >
            <Ionicons
              name="add"
              size={22}
              style={{ opacity: zoom === MAX_ZOOM_LEVEL ? 0.2 : 1 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={zoomOut}
            disabled={zoom === MIN_ZOOM_LEVEL}
          >
            <Ionicons
              name="remove"
              size={22}
              style={{ opacity: zoom === MIN_ZOOM_LEVEL ? 0.2 : 1 }}
            />
          </TouchableOpacity>
          {/* <Button title="Zoom In" onPress={zoomIn} />
          <Button title="Zoom Out" onPress={zoomOut} /> */}
        </View>
      </View>

      <View style={styles.buttonContainer}>
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
  buttonContainer: {
    // padding: 16,
    backgroundColor: 'white',
    bottom: 50,
    right: 10,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'red',
  },
  zoomButtons: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'column',
  },
});
