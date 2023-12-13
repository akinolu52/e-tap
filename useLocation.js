import * as Location from 'expo-location';
import { useEffect, useRef, useState } from "react";
import { Alert } from 'react-native';

export function useLocation() {
    const MIN_ZOOM_LEVEL = 3;
    const MAX_ZOOM_LEVEL = 20;
    const MAX_ACCEPTABLE_ACCURACY = 10 // 10 meters

    const [zoom, setZoom] = useState(14);
    const [userLocation, setUserLocation] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState(false);
    const [locationSubscription, setLocationSubscription] = useState(null);

    const mapRef = useRef(null);

    const [markers, setMarkers] = useState([
        { id: 1, title: 'Point 1', coordinate: { latitude: 6.4541, longitude: 3.3947 } },
        { id: 2, title: 'Point 2', coordinate: { latitude: 6.432012, longitude: 3.4153161 } },
    ]);

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    };

    const startTracking = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();

        if (status === Location.PermissionStatus.GRANTED) {
            // Subscribe to location updates
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 10000,
                    distanceInterval: 50
                },
                (location) => {
                    console.log(location);
                    if (location.coords.accuracy > MAX_ACCEPTABLE_ACCURACY) {
                        // Handle GPS signal loss
                        Alert.alert(
                            'GPS Accuracy',
                            "Can't get GPS signal",
                            [
                                {
                                    text: 'OK',
                                    onPress: () => console.log('OK Pressed')
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                }
            );

            setLocationSubscription(locationSubscription);
            setTrackingStatus(true);
        } else {
            Alert.alert(
                'Location Permission',
                'Permission not granted',
                [
                    {
                        text: 'OK',
                        onPress: () => console.log('OK Pressed')
                    }
                ],
                { cancelable: false }
            );
        }
    };

    const stopTracking = async () => {
        if (locationSubscription) {
            await locationSubscription.remove();
            setLocationSubscription(null);
        }
        setTrackingStatus(false);
    };

    useEffect(() => {
        getLocation();
        return () => {
            stopTracking();
        };
    }, []);

    const zoomIn = () => {
        if (userLocation) {
            const newRegion = {
                ...userLocation,
                latitudeDelta: userLocation.latitudeDelta / 10,
                longitudeDelta: userLocation.longitudeDelta / 10,
            };
            setUserLocation(newRegion);
            setCurrentZoomLevel(true);
            mapRef?.current?.animateToRegion(newRegion, 100);
        }
    };

    const zoomOut = () => {
        if (userLocation) {
            const newRegion = {
                ...userLocation,
                latitudeDelta: userLocation.latitudeDelta * 10,
                longitudeDelta: userLocation.longitudeDelta * 10,
            };
            setUserLocation(newRegion);
            setCurrentZoomLevel(false)
            mapRef?.current?.animateToRegion(newRegion, 100);
        }
    };

    const setCurrentZoomLevel = (isZoomIn) => {
        let currentZoomLevel = zoom;
        // if zoomlevel set to max value and user click on minus icon, first decrement the level before checking threshold value
        if (!isZoomIn && currentZoomLevel === MAX_ZOOM_LEVEL) {
            currentZoomLevel -= 1;
        }
        // if zoomlevel set to min value and user click on plus icon, first increment the level before checking threshold value
        else if (isZoomIn && currentZoomLevel === MIN_ZOOM_LEVEL) {
            currentZoomLevel += 1;
        }
        if (
            currentZoomLevel >= MAX_ZOOM_LEVEL ||
            currentZoomLevel <= MIN_ZOOM_LEVEL
        ) {
            return;
        }

        currentZoomLevel = isZoomIn ? currentZoomLevel + 1 : currentZoomLevel - 1;

        setZoom(currentZoomLevel);
    }

    return {
        startTracking,
        stopTracking,

        trackingStatus,
        userLocation,
        setUserLocation,

        markers,
        mapRef,

        zoom,
        zoomIn,
        zoomOut,

        MIN_ZOOM_LEVEL,
        MAX_ZOOM_LEVEL,
    }
}
