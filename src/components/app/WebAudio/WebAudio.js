import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import { initialize, showModal } from '../../../actions/volca.actions';
import { MODAL_UNLOCK_IOS_AUDIO } from '../../../constants/modaltypes';

let audioContext;

class WebAudio extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  /**
   * When the component mounts:
   * Create an AudioContext to play the encoded samples.
   */
  componentDidMount() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.detectIOSDevice();
  }

  componentWillUnmount() {
    audioContext.close();
  }

  detectIOSDevice() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this.props.dispatch(showModal(MODAL_UNLOCK_IOS_AUDIO));
    } else {
      this.props.dispatch(initialize());
    }
  }

  render() {
    return null;
  }
}

export function getAudioContext() {
  return audioContext;
}

function mapStateToProps() {
  return {};
}

export default compose(connect(mapStateToProps))(WebAudio);
