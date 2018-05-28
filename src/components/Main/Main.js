/**
 * Volca Freesound app.
 *
 * 1. load sound data
 * 1a. update view
 * 2. load mp3
 * 2a. update view
 * 3. convert audio
 * 3a. update view
 * 4. transfer
 * 4a. update view while transferring
 * 5. done transferring
 *
 * 1. Initially all slots are selected.
 * 2. Range selectors adjust the range from first to last slot.
 * 3. All and Clear buttons to select all or no slots.
 * 4. Slots are clickable to toggle individual slots.
 * 5. Click and drag to select multiple slots.
 */

import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Main.css';
import { initialize } from '../../actions/volca.actions';
import Freesound from '../../components/Freesound';
import Section from '../../components/Section';
import Slots from '../../components/Slots';
import Sound from '../../components/Sound';
import Transfer from '../../components/Transfer';
import Volca from '../../components/Volca';

let audioContext;

class Main extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  /**
   * When the component mounts:
   * Create an AudioContext to play the encoded samples.
   */
  componentDidMount() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.props.dispatch(initialize());
  }

  componentWillUnmount() {
    audioContext.close();
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.grid}>
            <div className={s.grid__column}>
              <Section title="Freesound settings">
                <Freesound />
              </Section>
              <Section title="Sound settings">
                <Sound />
              </Section>
              <Section title="File transfer">
                <Transfer />
              </Section>
            </div>
            <div className={s.grid__column}>
              <Section title="Volca sample slot settings">
                <Volca />
                <Slots />
              </Section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Main);

export function getAudioContext() {
  return audioContext;
}
