# TPStreams Integration with React Native Video

This project demonstrates how to integrate live streams from **TPStreams** using `react-native-video` with DRM support (FairPlay for iOS and Widevine for Android).

It serves as a reference implementation for clients wishing to use TPStreams in their own React Native applications.

## Prerequisites

Before starting, ensure you have the following in your project:

- **React Native** >= 0.70
- **tpstreams credentials**: `ORG_ID`, `ASSET_ID`, and `ACCESS_TOKEN`.

## Step 1: Install Dependencies

You need `react-native-video` for playback and `axios` to handle DRM license requests.

```bash
npm install react-native-video axios
# or
yarn add react-native-video axios
```

### iOS Specific Setup
For iOS, you need to install the native pods.

```bash
cd ios && pod install && cd ..
```

## Step 2: Implementation

Follow these steps to configure the video player in your React component (e.g., `App.tsx`).

### 1. Imports

Import the `Video` component, DRM types, and `axios`.

```typescript
import Video, { DRMType } from 'react-native-video';
import axios from 'axios';
import { Platform } from 'react-native';
```

### 2. Configuration Constants

Define the constants for your stream.

```typescript
const ORG_ID = 'your_org_id';
const ASSET_ID = 'your_asset_id';
const ACCESS_TOKEN = 'your_access_token';

// Base URL for the stream
const BASE_URL = `https://dlbdnoa93s0gw.cloudfront.net/live/${ORG_ID}/${ASSET_ID}/`;
```

### 3. DRM Configuration Function

This is the most critical part. TPStreams uses DRM protection, so you must configure **FairPlay** for iOS and **Widevine** for Android.

You need to implement a custom `getLicense` function to fetch the license with the correct headers and format.

```typescript
const createDRMConfig = () => {
  const isIOS = Platform.OS === 'ios';

  if (isIOS) {
    // iOS: FairPlay DRM
    return {
      type: DRMType.FAIRPLAY,
      licenseServer: `https://app.tpstreams.com/api/v1/${ORG_ID}/assets/${ASSET_ID}/drm_license/?access_token=${ACCESS_TOKEN}&drm_type=fairplay`,
      certificateUrl: 'https://static.testpress.in/static/fairplay.cer', // Standard certificate URL
      getLicense: async (spcString: string, contentId: string, licenseUrl: string) => {
        try {
          // Fetch license from TPStreams
          const response = await axios.post(
            licenseUrl,
            JSON.stringify({ spc: spcString, assetId: contentId }),
            {
              headers: { 'Content-Type': 'application/json' },
              responseType: 'arraybuffer', // Important: response must be arraybuffer
            }
          );
          // Convert binary response to base64
          return btoa(String.fromCharCode(...new Uint8Array(response.data)));
        } catch (error) {
          console.error('FairPlay license error:', error);
          throw error;
        }
      },
    };
  } else {
    // Android: Widevine DRM
    return {
      type: DRMType.WIDEVINE,
      licenseServer: `https://app.tpstreams.com/api/v1/${ORG_ID}/assets/${ASSET_ID}/drm_license/?access_token=${ACCESS_TOKEN}&drm_type=widevine`,
      getLicense: async (spcString: string, contentId: string, licenseUrl: string) => {
        try {
          const response = await axios.post(
            licenseUrl,
            JSON.stringify({ spc: spcString, assetId: contentId }),
            {
              headers: { 'Content-Type': 'application/json' },
              responseType: 'arraybuffer',
            }
          );
          return btoa(String.fromCharCode(...new Uint8Array(response.data)));
        } catch (error) {
          console.error('Widevine license error:', error);
          throw error;
        }
      },
    };
  }
};
```

### 4. Create Video Source

Construct the source object. Note the file extensions: `.m3u8` for iOS/FairPlay and `.mpd` for Android/Widevine.

```typescript
const createVideoSource = () => {
  const isIOS = Platform.OS === 'ios';
  
  // Choose manifest format based on platform
  const manifestFormat = isIOS ? 'm3u8' : 'mpd'; 

  return {
    uri: `${BASE_URL}video.${manifestFormat}`,
    type: manifestFormat,
    drm: createDRMConfig(), // Attach the DRM config created above
  };
};
```

### 5. Render the Video Component

Component usage example:

```tsx
const MyVideoPlayer = () => {
  const source = createVideoSource();

  return (
    <Video
      source={source}
      style={{ width: '100%', height: 300, backgroundColor: 'black' }}
      controls={true}
      resizeMode="contain"
      onError={(e) => console.log('Video Error:', e)}
      onLoad={() => console.log('Video Loaded')}
    />
  );
};
```

## Step 3: Add Live Chat

You can also integrate the TPStreams Live Chat SDK using a WebView.

### 1. Install WebView
```bash
npm install react-native-webview
cd ios && pod install && cd ..
```

### 2. Create Chat Component
Create a reusable `ChatComponent.tsx` that loads the chat SDK via HTML.

```tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const ChatComponent = ({ roomId }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://static.tpstreams.com/static/css/live_chat_v1.css">
      <script src="https://static.tpstreams.com/static/js/live_chat_v1.umd.cjs"></script>
      <style>body { margin: 0; background-color: #000; }</style>
    </head>
    <body>
      <div id="app"></div>
      <script>
        const config = {
          username: "Guest",
          roomId: "${roomId}",
          title: "Chat"
        };
        function init() {
          if (window.TPStreamsChat) {
            new TPStreamsChat.load(document.querySelector("#app"), config);
          } else {
            setTimeout(init, 100);
          }
        }
        init();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 400, width: '100%' }}>
      <WebView
        source={{ html: htmlContent }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default ChatComponent;
```

### 3. Add to App

Import and use it below your video player:

```tsx
import ChatComponent from './ChatComponent';

// ... inside your component
const CHAT_ROOM_ID = 'your_chat_room_id';

{source && <ChatComponent roomId={CHAT_ROOM_ID} />}
```

## Troubleshooting

- **License Errors**: Ensure your `ACCESS_TOKEN` is valid and the `ORG_ID` / `ASSET_ID` are correct.

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **iOS**:
    ```bash
    cd ios && pod install && cd ..
    npm run ios
    ```
3.  **Android**:
    ```bash
    npm run android
    ```
