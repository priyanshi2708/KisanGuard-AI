/**
 * KisanGuard AI - Browser Audio Recording Service
 * 
 * Reliable browser audio recorder using standard HTML5 MediaRecorder API.
 * Handles microphone permissions, stream capture, audio chunks, and graceful error states.
 */

class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.maxDurationTimer = null;
  }

  /**
   * Checks if audio recording is supported by the current browser environment.
   */
  isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  /**
   * Starts microphone recording.
   * @param {Object} options - { onMaxDurationReached }
   * @returns {Promise<{success: boolean, errorType?: string, messageGu?: string, messageEn?: string}>}
   */
  async startRecording(options = {}) {
    if (!this.isSupported()) {
      return {
        success: false,
        errorType: 'UNSUPPORTED_BROWSER',
        messageGu: 'તમારા બ્રાઉઝરમાં માઇક્રોફોન રેકોર્ડિંગ સપોર્ટ નથી.',
        messageHi: 'आपके ब्राउज़र में माइक्रोफ़ोन रिकॉर्डिंग समर्थित नहीं है।',
        messageEn: 'Microphone recording is not supported in your browser.'
      };
    }

    // Safety guard: prevent starting duplicate streams if already recording
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      return { success: true };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Find supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
        ''
      ];

      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorderOptions = selectedMime ? { mimeType: selectedMime } : undefined;
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect slice every 250ms

      // Auto-stop safety timer after 60 seconds of max continuous recording
      if (this.maxDurationTimer) clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          if (options.onMaxDurationReached) {
            options.onMaxDurationReached();
          }
        }
      }, 60000);

      return { success: true };

    } catch (error) {
      console.error('[AudioRecorderService] Error starting microphone:', error);
      this.cleanupStream();

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return {
          success: false,
          errorType: 'PERMISSION_DENIED',
          messageGu: 'માઇક્રોફોનની પરવાનગી જરૂરી છે.',
          messageHi: 'माइक्रोफ़ोन की अनुमति आवश्यक है।',
          messageEn: 'Microphone permission is required.'
        };
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        return {
          success: false,
          errorType: 'NO_MICROPHONE',
          messageGu: 'કોઈ માઇક્રોફોન મળ્યો નથી.',
          messageHi: 'कोई माइक्रोफ़ोन नहीं मिला।',
          messageEn: 'No microphone hardware found.'
        };
      }

      return {
        success: false,
        errorType: 'RECORDING_FAILURE',
        messageGu: 'અવાજ રેકોર્ડ કરી શકાયો નથી. ફરી પ્રયાસ કરો.',
        messageHi: 'आवाज़ रिकॉर्ड नहीं की जा सकी। पुनः प्रयास करें।',
        messageEn: 'Could not record audio. Please try again.'
      };
    }
  }

  /**
   * Stops recording and returns the compiled audio Blob.
   * @returns {Promise<{success: boolean, blob?: Blob, errorType?: string, messageGu?: string, messageEn?: string}>}
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (this.maxDurationTimer) {
        clearTimeout(this.maxDurationTimer);
        this.maxDurationTimer = null;
      }

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanupStream();
        resolve({
          success: false,
          errorType: 'NOT_RECORDING',
          messageGu: 'રેકોર્ડિંગ શરૂ નથી.',
          messageEn: 'Recording was not active.'
        });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanupStream();

        if (audioBlob.size < 500) {
          resolve({
            success: false,
            errorType: 'EMPTY_RECORDING',
            messageGu: 'અવાજ ખૂબ ટૂંકો કે ખાલી છે. ફરી પ્રયાસ કરો.',
            messageHi: 'आवाज़ बहुत छोटी या खाली है। पुनः प्रयास करें।',
            messageEn: 'Recording was empty or too short. Please try again.'
          });
          return;
        }

        resolve({
          success: true,
          blob: audioBlob,
          mimeType
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.error('[AudioRecorderService] Error stopping recorder:', err);
        this.cleanupStream();
        resolve({
          success: false,
          errorType: 'STOP_FAILED',
          messageGu: 'અવાજ રેકોર્ડિંગ બંધ કરવામાં સમસ્યા આવી.',
          messageEn: 'Failed to stop recording.'
        });
      }
    });
  }

  /**
   * Cancels active recording without producing output.
   */
  cancelRecording() {
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.onstop = null;
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.cleanupStream();
    this.audioChunks = [];
  }

  /**
   * Cleans up microphone stream tracks.
   */
  cleanupStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
  }
}

export const audioRecorder = new AudioRecorderService();
export default audioRecorder;
