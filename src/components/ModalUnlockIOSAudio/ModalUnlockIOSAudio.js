import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { initialize, hideModal } from '../../actions/volca.actions';
import s from './ModalUnlockIOSAudio.css';
import Modal from '../Modal';
import { getAudioContext } from '../Main';

class ModalUnlockIOSAudio extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  unlockIOSAudio() {
    const audioContext = getAudioContext();

    // create an empty buffer
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // play the empty buffer
    if (typeof source.start === 'undefined') {
      source.noteOn(0);
    } else {
      source.start(0);
    }

    // setup a timer to wait for audio to run
    const interval = setInterval(() => {
      if (audioContext.currentTime > 0) {
        clearInterval(interval);
        this.props.dispatch(initialize());
        this.props.dispatch(hideModal());
      }
    }, 100);
  }

  render() {
    const { dispatch } = this.props;

    return (
      <Modal
        onClose={() => {
          dispatch(hideModal());
        }}
      >
        <div className={s.dialog_content}>
          <h2>Click</h2>
          <p>Click to enter the app</p>
          <button
            onClick={() => {
              this.unlockIOSAudio();
            }}
          >
            Ok
          </button>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(
  ModalUnlockIOSAudio,
);
