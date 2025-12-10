import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Button,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Video, { DRMType, ReactVideoSourceProperties } from 'react-native-video';
import axios from 'axios';
import ChatComponent from './ChatComponent';

type SourceType = ReactVideoSourceProperties | null;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<SourceType>(null);

  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const isDRM = false;

  const ORG_ID = '9q94nm';
  const ASSET_ID = '6MyAAbmyfdm';
  const ACCESS_TOKEN = 'd3578ca8-3b17-4590-ae40-f585ba8341c3';
  const CHAT_ROOM_ID = 'ef0aefe1-3aa1-4887-9362-a81781e557aa'; //chat room id can be obtained from the Asset detail API
  const BASE_URL = `https://dlbdnoa93s0gw.cloudfront.net/live/${ORG_ID}/${ASSET_ID}/`;

  const createDRMConfig = () => {
    if (isIOS) {
      return {
        type: DRMType.FAIRPLAY,
        licenseServer: `https://app.tpstreams.com/api/v1/${ORG_ID}/assets/${ASSET_ID}/drm_license/?access_token=${ACCESS_TOKEN}&drm_type=fairplay`,
        certificateUrl: 'https://static.testpress.in/static/fairplay.cer',
        getLicense: async (spcString: string, contentId: string, licenseUrl: string) => {
          try {
            const response = await axios.post(
              licenseUrl,
              JSON.stringify({ spc: spcString, assetId: contentId }),
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
              },
            );
            const base64License = btoa(String.fromCharCode(...new Uint8Array(response.data)));
            return base64License;
          } catch (error) {
            console.error('FairPlay license request failed:', error);
            throw error;
          }
        },
      };
    } else {
      return {
        type: DRMType.WIDEVINE,
        licenseServer: `https://app.tpstreams.com/api/v1/${ORG_ID}/assets/${ASSET_ID}/drm_license/?access_token=${ACCESS_TOKEN}&drm_type=widevine`,
        getLicense: async (spcString: string, contentId: string, licenseUrl: string) => {
          try {
            const response = await axios.post(
              licenseUrl,
              JSON.stringify({ spc: spcString, assetId: contentId }),
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
              },
            );
            const base64License = btoa(String.fromCharCode(...new Uint8Array(response.data)));
            return base64License;
          } catch (error) {
            console.error('Widevine license request failed:', error);
            throw error;
          }
        },
      };
    }
  };

  const createVideoSource = () => {

    const manifestFormat = isDRM
      ? isIOS
        ? 'm3u8'
        : 'mpd'
      : 'm3u8';

    return {
      type: manifestFormat,
      uri: `${BASE_URL}video.${manifestFormat}`,
      drm: createDRMConfig(),
    };
  };

  const handlePlayStopVideo = () => {
    if (source) {
      setSource(null);
      setLoading(false);
    } else {
      setLoading(true);
      setSource(createVideoSource());
    }
  };

  const handleVideoError = (error: any) => {
    Alert.alert(
      'Playback Error',
      error.error?.localizedDescription || 'Unknown error',
    );
    setLoading(false);
    setSource(null);
  };

  const handleVideoLoad = () => {
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>DRM Protected Stream Player</Text>
      <Text style={styles.platformInfo}>
        Platform: {Platform.OS.toUpperCase()} - {isIOS ? 'FairPlay (M3U8)' : 'Widevine (MPD)'}
      </Text>

      {loading && <ActivityIndicator size="large" color="#00f" />}

      {source && (
        <Video
          source={source}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          style={styles.video}
          controls
          resizeMode="contain"
        />
      )}

      {source && <ChatComponent roomId={CHAT_ROOM_ID} />}

      <Button
        title={source ? 'Stop Video' : 'Play Video'}
        onPress={handlePlayStopVideo}
      />
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white'
  },
  platformInfo: {
    fontSize: 14,
    marginBottom: 10,
    color: '#ccc',
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: 200,
    marginBottom: 10
  },
});