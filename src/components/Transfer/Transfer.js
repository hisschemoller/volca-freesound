import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { pause, start } from '../../actions/volca.actions';
import downloadReceipt from '../../actions/downloadReceipt.actions';
import fetchRandomSound from '../../actions/fetchRandomSound.actions';
import s from './Transfer.css';
import Row from '../Row';
import Section from '../Section';

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
    let btnText = 'Start';
    if (this.props.isStarted) {
      btnText = this.props.isPaused ? 'Stopping...' : 'Stop';
    }
    return (
      <Section title="File transfer">
        <Row>
          <progress max="1" value={this.props.position} />
          <span>{Math.round(this.props.position * 100)}%</span>
          <button
            onClick={e => {
              e.preventDefault();
              if (this.props.isStarted) {
                this.props.dispatch(pause());
              } else {
                this.props.dispatch(start());
                this.props.dispatch(fetchRandomSound());
              }
            }}
            type="button"
          >
            {btnText}
          </button>
        </Row>
        <div
          className={
            s.receipt + (this.props.showReceipt ? ` ${s.receiptreveal}` : '')
          }
        >
          <span className={s.textline}>
            File transfer has finished. Please download your receipt.
          </span>
          <button
            onClick={e => {
              e.preventDefault();
              this.props.dispatch(downloadReceipt());
            }}
            type="button"
          >
            Download receipt (text file)
          </button>
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
