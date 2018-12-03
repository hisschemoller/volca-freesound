import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { pause, start } from '../../../actions/volca.actions';
import downloadReceipt from '../../../actions/downloadReceipt.actions';
import evaluateSounds from '../../../actions/evaluateSounds.actions';
import s from './Transfer.css';
import Row from '../../atoms/Row';
import Section from '../../molecules/Section';

class Transfer extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    position: PropTypes.number.isRequired,
    showReceipt: PropTypes.bool.isRequired,
  };

  static defaultProps = {};

  render() {
    const { dispatch, isPaused, isStarted, position, showReceipt } = this.props;

    const sectionStyle = {
      borderBottom: 'none',
    };

    let btnText = 'Start';
    if (isStarted) {
      btnText = isPaused ? 'Stopping...' : 'Stop';
    }

    return (
      <Section title="File transfer" style={sectionStyle}>
        <Row hideBottomBorder={!showReceipt}>
          <progress max="1" value={position} className={s.progress} />
          <span>{Math.round(position * 100)}%</span>
          <button
            onClick={e => {
              e.preventDefault();
              if (isStarted) {
                dispatch(pause());
              } else {
                dispatch(start());
                dispatch(evaluateSounds());
              }
            }}
            type="button"
          >
            {btnText}
          </button>
        </Row>
        <div className={s.receipt + (showReceipt ? ` ${s.receiptreveal}` : '')}>
          <Row>
            <span className={s.textline}>
              File transfer has finished. Please download your receipt.
            </span>
          </Row>
          <Row>
            <button
              onClick={e => {
                e.preventDefault();
                dispatch(downloadReceipt());
              }}
              type="button"
            >
              Download receipt (text file)
            </button>
          </Row>
        </div>
      </Section>
    );
  }
}

function mapStateToProps(state) {
  return {
    isPaused: state.sounds.isPaused,
    isStarted: state.sounds.isStarted,
    position: state.sounds.position,
    showReceipt: !!state.sounds.sounds.allIds.length && !state.sounds.isStarted,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Transfer);
