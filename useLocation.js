import { toast } from '@backpackapp-io/react-native-toast';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from "react";
import { Alert } from 'react-native';

function toRad(angle) {
    return (angle * Math.PI) / 180;
}

function computeDistance([prevLat, prevLong], [lat, long]) {
    const prevLatInRad = toRad(prevLat);
    const prevLongInRad = toRad(prevLong);
    const latInRad = toRad(lat);
    const longInRad = toRad(long);

    return (
        // In kilometers
        6377.830272 *
        Math.acos(
            Math.sin(prevLatInRad) * Math.sin(latInRad) +
            Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),
        )
    );
}

export function useLocation() {
    const MIN_ZOOM_LEVEL = 3;
    const MAX_ZOOM_LEVEL = 20;
    const MAX_ACCEPTABLE_ACCURACY = 10 // 10 meters
    const geofences = [
        { id: '1', latitude: 6.4541, longitude: 3.3947, radius: 100 },
        { id: '2', latitude: 6.432012, longitude: 3.4153161, radius: 100 },
    ];

    const [zoom, setZoom] = useState(14);
    const [userLocation, setUserLocation] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState(false);
    const [locationSubscription, setLocationSubscription] = useState(null);
    const [geofenceRegions, setGeofenceRegions] = useState(geofences);
    const [isInsideGeofence, setIsInsideGeofence] = useState(false);
    const [isAnimating, setIsAnimating] = useState("");

    // console.log('isAnimating:: ', isAnimating);

    const mapRef = useRef(null);

    const [markers, setMarkers] = useState([
        { id: 1, title: 'Point 1', coordinate: { latitude: 6.4541, longitude: 3.3947 } },
        { id: 2, title: 'Point 2', coordinate: { latitude: 6.432012, longitude: 3.4153161 } },
    ]);

    const updateLocation = (newRegion) => {
        setUserLocation(newRegion);
        mapRef?.current?.animateToRegion(newRegion, 100);
    }

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            updateLocation(newRegion);
        }
    };

    const startTracking = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();

        if (status === Location.PermissionStatus.GRANTED) {
            toast('locating tracking started.', { width: 205 });

            setIsAnimating("play")
            // Subscribe to location updates
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 10000,
                    distanceInterval: 50
                },
                (location) => {
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
                    toast('locating tracking received.', { width: 215 });
                    checkGeofenceStatus(location.coords);
                    const newRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    };
                    updateLocation(newRegion);
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

    const pauseTracking = async () => {
        if (locationSubscription) {
            await locationSubscription.remove();
            setLocationSubscription(null);
        }
        toast('locating tracking paused.', { width: 210 });
        setTrackingStatus(false);
        setIsAnimating("pause")
    };

    const stopTracking = async () => {
        if (locationSubscription) {
            await locationSubscription.remove();
            setLocationSubscription(null);
        }
        toast('locating tracking stopped.', { width: 210 });
        setTrackingStatus(false);
        setIsAnimating("stop")
    };

    const zoomIn = () => {
        if (userLocation) {
            const newRegion = {
                ...userLocation,
                latitudeDelta: userLocation.latitudeDelta / 10,
                longitudeDelta: userLocation.longitudeDelta / 10,
            };
            setCurrentZoomLevel(true);
            updateLocation(newRegion);
        }
    };

    const zoomOut = () => {
        if (userLocation) {
            const newRegion = {
                ...userLocation,
                latitudeDelta: userLocation.latitudeDelta * 10,
                longitudeDelta: userLocation.longitudeDelta * 10,
            };
            setCurrentZoomLevel(false);
            updateLocation(newRegion);
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

    const checkGeofenceStatus = (userCoords) => {
        if (!userCoords) {
            return;
        }

        // Check if the user is inside any geofence
        const insideGeofence = geofenceRegions.some((geofence) => {
            const res = computeDistance([userCoords.latitude, userCoords.longitude], [geofence.latitude, geofence.longitude])

            return res < geofence.radius;
        });

        if (insideGeofence !== isInsideGeofence) {
            // Geofence status changed
            setIsInsideGeofence(insideGeofence);

            // Notify the user
            sendGeofenceNotification(insideGeofence);
        }
    };

    const sendGeofenceNotification = async (insideGeofence) => {
        const title = insideGeofence ? 'Entered Geofence' : 'Exited Geofence';
        const body = insideGeofence ? 'You are inside the geofence area.' : 'You left the geofence area.';

        // Send local notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: null, // Send immediately
        });
    };

    useEffect(() => {
        getLocation();
        checkGeofenceStatus();

        return () => {
            stopTracking();
        };
    }, []);

    return {
        startTracking,
        pauseTracking,
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

        isAnimating,
        setIsAnimating,
    }
}
