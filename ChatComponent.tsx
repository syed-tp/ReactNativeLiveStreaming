import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface ChatComponentProps {
    roomId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ roomId }) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en" style="height: 100%">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <link rel="stylesheet" href="https://static.tpstreams.com/static/css/live_chat_v1.css">
      <script src="https://static.tpstreams.com/static/js/live_chat_v1.umd.cjs"></script>
      <style>
        body { margin: 0; background-color: #000; }
        #app { height: 100%; }
        
        /* Compact Mode Overrides */
        .space-y-8 > :not([hidden]) ~ :not([hidden]) {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .py-12 {
            padding-top: 0.5rem !important; 
            padding-bottom: 0.5rem !important; 
        }
        .px-4, .px-6, .p-4, .p-6 {
            padding: 8px !important;
        }
        h1, h2, h3 {
            font-size: 1.2rem !important;
            margin-bottom: 0.5rem !important;
        }
        /* Message list overrides if possible */
        li, .message {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
        }
        
        /* Premium Dark Theme enhancements */
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #e0e0e0;
        }
        
        /* Scrollbar customization */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #111;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
      </style>
    </head>
    <body>
      <div id="app"></div>

      <script>
        const config = {
          username: "Guest User",
          roomId: "${roomId}",
          title: ""
        };
        
        const initChat = () => {
          if (window.TPStreamsChat) {
            TPStreamsChat.load(document.querySelector("#app"), config);
          } else {
            setTimeout(initChat, 100);
          }
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initChat);
        } else {
          initChat();
        }
      </script>
    </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator size="small" color="#0000ff" />}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                nestedScrollEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 550,
        width: '100%',
        marginTop: 10,
        backgroundColor: '#000',
        overflow: 'hidden',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default ChatComponent;
