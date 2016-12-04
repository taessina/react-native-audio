import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
} from 'react-native';

import { AudioRecorder, AudioUtils } from 'react-native-audio';

class AudioExample extends Component {
  state = {
    currentTime: 0.0,
    recording: false,
    stoppedRecording: false,
    stoppedPlaying: false,
    playing: false,
    finished: false,
    currentMetering: 0.0,
    maxAmplitude: 0.0,
  };

  prepareRecordingPath(audioPath){
    let audioSetting = {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000,
      MeteringEnabled: true,
    };
    if (Platform.OS === 'ios') {
      audioSetting = {
        ...audioSetting,
        MeteringEnabled: true,
      }
    }
    AudioRecorder.prepareRecordingAtPath(audioPath, audioSetting);
  }

  componentDidMount() {
    let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';
    this.prepareRecordingPath(audioPath);

    // ios only has onProgress event
    AudioRecorder.onProgress = (data) => {
      this.setState({
        currentTime: Math.floor(data.currentTime),
        currentMetering: Math.floor(data.currentMetering)
      });
    };
    AudioRecorder.onFinished = (data) => {
      this.setState({finished: data.finished});
      console.log(`Finished recording: ${data.finished}`);
    };

  }

  _renderButton(title, onPress, active) {
    var style = (active) ? styles.activeButtonText : styles.buttonText;

    return (
      <TouchableHighlight style={styles.button} onPress={onPress}>
        <Text style={style}>
          {title}
        </Text>
      </TouchableHighlight>
    );
  }

  _pause() {
    if (this.state.recording){
      AudioRecorder.pauseRecording();
      this.setState({stoppedRecording: true, recording: false});
    }
    else if (this.state.playing) {
      AudioRecorder.pausePlaying();
      this.setState({playing: false, stoppedPlaying: true});
    }
  }

  _stop() {
    if (this.state.recording) {
      AudioRecorder.stopRecording();
      this.setState({stoppedRecording: true, recording: false});
    } else if (this.state.playing) {
      AudioRecorder.stopPlaying();
      this.setState({playing: false, stoppedPlaying: true});
    }
  }

  _record() {
    if(this.state.stoppedRecording){
      let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';
      this.prepareRecordingPath(audioPath);
    }
    AudioRecorder.startRecording();
    this.setState({recording: true, playing: false});
  }

   _play() {
    if (this.state.recording) {
      this._stop();
      this.setState({recording: false});
    }
    AudioRecorder.playRecording();
    this.setState({playing: true});
  }

  _getMaxAmplitude() {
    console.log(AudioRecorder);
    if (this.state.recording) {
      this.setState({ maxAmplitude: AudioRecorder.getMaxAmplitude() });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          {this._renderButton("RECORD", () => {this._record()}, this.state.recording )}
          {this._renderButton("STOP", () => {this._stop()} )}
          {this._renderButton("PAUSE", () => {this._pause()} )}
          {this._renderButton("PLAY", () => {this._play()}, this.state.playing )}
          {this._renderButton("AMPLITUDE", () => {this._getMaxAmplitude()}, this.state.recording )}
          { Platform.OS === 'ios' &&
            <Text style={styles.progressText}>{this.state.currentTime}s</Text>
          }
          { Platform.OS === 'ios' &&
            <Text style={styles.progressText}>{this.state.currentMetering}</Text>
          }
          { Platform.OS !== 'ios' &&
            <Text style={styles.progressText}>{this.state.maxAmplitude}</Text>
          }
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2b608a",
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    paddingTop: 50,
    fontSize: 50,
    color: "#fff"
  },
  button: {
    padding: 20
  },
  disabledButtonText: {
    color: '#eee'
  },
  buttonText: {
    fontSize: 20,
    color: "#fff"
  },
  activeButtonText: {
    fontSize: 20,
    color: "#B81F00"
  }
});

export default AudioExample;
