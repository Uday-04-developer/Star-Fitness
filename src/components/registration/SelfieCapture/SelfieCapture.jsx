import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import styles from './SelfieCapture.module.css';

const MAX_EDGE = 800;
const JPEG_QUALITY = 0.8;

const isAbortError = (error) =>
  error?.name === 'AbortError' ||
  String(error?.message || '')
    .toLowerCase()
    .includes('interrupted');

const resizeToJpegBlob = (sourceCanvas) =>
  new Promise((resolve, reject) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const longest = Math.max(width, height);
    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const output = document.createElement('canvas');
    output.width = targetWidth;
    output.height = targetHeight;
    const context = output.getContext('2d');

    if (!context) {
      reject(new Error('Could not process selfie.'));
      return;
    }

    context.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    output.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not compress selfie.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });

const SelfieCapture = ({ onCapture, existingImage = '', error = '' }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isMountedRef = useRef(true);
  const [permissionState, setPermissionState] = useState('idle');
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stopStream = () => {
    streamRef.current?.getTracks()?.forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopStream();
    };
  }, []);

  const attachStreamToVideo = async (stream) => {
    const video = videoRef.current;
    if (!video) {
      return false;
    }

    video.srcObject = stream;
    try {
      await video.play();
    } catch (playError) {
      if (!isAbortError(playError)) {
        throw playError;
      }
    }
    return true;
  };

  const startCamera = async () => {
    setErrorMessage('');
    setPermissionState('requesting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState('unsupported');
      setErrorMessage(
        'Camera is not supported on this device. Please use a phone or laptop with a camera.',
      );
      return;
    }

    try {
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      // Wait one frame so the <video> mounts after "requesting" state.
      await new Promise((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const attached = await attachStreamToVideo(stream);
      if (!attached && videoRef.current) {
        await attachStreamToVideo(stream);
      }

      if (isMountedRef.current) {
        setPermissionState('ready');
      }
    } catch (cameraError) {
      if (isAbortError(cameraError) || !isMountedRef.current) {
        return;
      }

      console.error(cameraError);
      setPermissionState('denied');
      setErrorMessage(
        'Camera access was denied. Allow camera permission in your browser, then try again.',
      );
    }
  };

  const handleCapture = async () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setErrorMessage('Camera is not ready yet. Wait a moment, then capture again.');
      return;
    }

    setIsCapturing(true);
    setErrorMessage('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);

      const blob = await resizeToJpegBlob(canvas);
      stopStream();
      setPermissionState('captured');
      onCapture?.(blob);
    } catch (captureError) {
      console.error(captureError);
      setErrorMessage('Could not capture selfie. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = async () => {
    onCapture?.(null);
    setPermissionState('idle');
    setErrorMessage('');
  };

  if (existingImage) {
    return (
      <div className={styles.wrap}>
        <img className={styles.preview} src={existingImage} alt="Captured selfie preview" />
        <div className={styles.actions}>
          <Button
            label="Retake"
            variant="secondary"
            icon={RefreshCcw}
            onClick={handleRetake}
          />
        </div>
      </div>
    );
  }

  const showVideo =
    permissionState === 'ready' || permissionState === 'requesting';

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        {showVideo ? (
          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <div className={styles.placeholder}>
            <Camera size={28} strokeWidth={1.75} aria-hidden="true" />
            <p>
              {permissionState === 'denied' || permissionState === 'unsupported'
                ? errorMessage
                : 'Tap below to turn on your camera, then capture your selfie.'}
            </p>
          </div>
        )}
      </div>

      {errorMessage &&
      permissionState !== 'denied' &&
      permissionState !== 'unsupported' ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        {permissionState === 'idle' ? (
          <Button
            label="Turn on camera"
            icon={Camera}
            onClick={startCamera}
          />
        ) : null}

        {permissionState === 'requesting' ? (
          <Button label="Starting camera…" disabled isLoading />
        ) : null}

        {permissionState === 'ready' ? (
          <Button
            label="Capture selfie"
            icon={Camera}
            onClick={handleCapture}
            isLoading={isCapturing}
          />
        ) : null}

        {(permissionState === 'denied' || permissionState === 'unsupported') && (
          <Button
            label="Try camera again"
            variant="secondary"
            icon={Camera}
            onClick={startCamera}
          />
        )}
      </div>
    </div>
  );
};

export default SelfieCapture;
