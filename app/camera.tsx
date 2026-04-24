import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';

import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import { useExpenseStore } from '@/src/store/expenseStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.78;
const CORNER_LENGTH = 35;
const CORNER_THICKNESS = 3;
const CORNER_COLOR = '#FFFFFF';

function ScanCorner({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  const isTop = position.includes('top');
  const isLeft = position.includes('Left');

  return (
    <View
      style={[
        styles.corner,
        {
          top: isTop ? -CORNER_THICKNESS / 2 : undefined,
          bottom: !isTop ? -CORNER_THICKNESS / 2 : undefined,
          left: isLeft ? -CORNER_THICKNESS / 2 : undefined,
          right: !isLeft ? -CORNER_THICKNESS / 2 : undefined,
        },
      ]}
    >
      {/* Horizontal bar */}
      <View
        style={{
          position: 'absolute',
          height: CORNER_THICKNESS,
          width: CORNER_LENGTH,
          backgroundColor: CORNER_COLOR,
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
        }}
      />
      {/* Vertical bar */}
      <View
        style={{
          position: 'absolute',
          width: CORNER_THICKNESS,
          height: CORNER_LENGTH,
          backgroundColor: CORNER_COLOR,
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
        }}
      />
    </View>
  );
}

export default function CameraScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const setPendingImage = useExpenseStore((state) => state.setPendingImage);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.3)" style={{ marginBottom: 20 }} />
        <Text style={styles.permissionText}>Kamerazugriff benötigt</Text>
        <Text style={styles.permissionSubtext}>
          Um Belege zu scannen, benötigt Spesify Zugriff auf deine Kamera.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Zugriff erlauben</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8, shutterSound: false });
      if (photo && photo.uri) {
        const newFileName = `${uuid.v4()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${newFileName}`;

        try {
          await FileSystem.copyAsync({
            from: photo.uri,
            to: newPath
          });

          setPendingImage(newPath);

          router.back();

        } catch (error) {
          console.error("Failed to save image", error);
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={isFlashOn}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Top: close button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Center: scan frame with corner brackets */}
        <View style={styles.scanAreaWrapper}>
          <View style={styles.scanFrame}>
            <ScanCorner position="topLeft" />
            <ScanCorner position="topRight" />
            <ScanCorner position="bottomLeft" />
            <ScanCorner position="bottomRight" />
          </View>
        </View>

        {/* Bottom: controls */}
        <View style={styles.bottomWrapper}>
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsFlashOn(!isFlashOn)}
            >
              <Ionicons
                name={isFlashOn ? 'flash' : 'flash-off'}
                size={26}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              activeOpacity={0.7}
            >
              <View style={styles.captureOuter}>
                <View style={styles.captureInner} />
              </View>
            </TouchableOpacity>

            {/* Placeholder to balance the layout */}
            <View style={styles.controlButton} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.25,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  bottomWrapper: {
    paddingBottom: 20,
  },

  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  permissionSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
