import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  clearAll,
  selectAll,
  setRange,
  setRangeFirst,
  setRangeLast,
} from '../../actions/volca.actions';
import s from './Volca.css';
import Row from '../Row';

class Volca extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isStarted: PropTypes.bool.isRequired,
    rangeFirst: PropTypes.number.isRequired,
    rangeLast: PropTypes.number.isRequired,
    slotCount: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div>
        <Row>
          <label htmlFor="from">
            <span>From</span>
            <input
              disabled={this.props.isStarted ? 'disabled' : ''}
              id="from"
              max={this.props.slotCount - 1}
              min="0"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setRangeFirst(e.target.value));
              }}
              type="number"
              value={this.props.rangeFirst}
            />
          </label>
          <label htmlFor="to">
            <span>To</span>
            <input
              disabled={this.props.isStarted ? 'disabled' : ''}
              id="to"
              max={this.props.slotCount - 1}
              min="0"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setRangeLast(e.target.value));
              }}
              type="number"
              value={this.props.rangeLast}
            />
          </label>
          <button
            disabled={this.props.isStarted ? 'disabled' : ''}
            onClick={e => {
              e.preventDefault();
              this.props.dispatch(setRange());
            }}
            type="button"
          >
            Set range
          </button>
        </Row>
        <Row>
          <button
            disabled={this.props.isStarted ? 'disabled' : ''}
            onClick={e => {
              e.preventDefault();
              this.props.dispatch(clearAll());
            }}
            type="button"
          >
            Clear All
          </button>
          <button
            disabled={this.props.isStarted ? 'disabled' : ''}
            onClick={e => {
              e.preventDefault();
              this.props.dispatch(selectAll());
            }}
            type="button"
          >
            Select All
          </button>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isStarted: state.sounds.isStarted,
    rangeFirst: state.sounds.rangeFirst,
    rangeLast: state.sounds.rangeLast,
    slotCount: state.sounds.slotCount,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);
