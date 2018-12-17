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
} from '../../../actions/volca.actions';
import s from './Volca.css';
import FormControl from '../../molecules/FormControl';
import Row from '../../atoms/Row';
import Section from '../../molecules/Section';
import Slots from '../Slots';

class Volca extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isStarted: PropTypes.bool.isRequired,
    rangeFirst: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    rangeLast: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    slotCount: PropTypes.number.isRequired,
  };

  render() {
    const {
      dispatch,
      isStarted,
      rangeFirst,
      rangeLast,
      slotCount,
    } = this.props;

    const isDisabled =
      typeof rangeFirst !== 'number' || typeof rangeLast !== 'number';

    const formControlStyle = {
      width: '36%',
    };

    return (
      <div>
        <Section title="Volca sample slot selection">
          <Row>
            <FormControl
              disabled={isStarted ? 'disabled' : ''}
              id="from"
              label="From"
              max={slotCount - 1}
              min="0"
              onChange={e => {
                e.preventDefault();
                dispatch(setRangeFirst(e.target.value));
              }}
              style={formControlStyle}
              type="number"
              value={rangeFirst}
            />
            <FormControl
              disabled={isStarted ? 'disabled' : ''}
              id="to"
              label="To"
              max={slotCount - 1}
              min="0"
              onChange={e => {
                e.preventDefault();
                dispatch(setRangeLast(e.target.value));
              }}
              style={formControlStyle}
              type="number"
              value={rangeLast}
            />
            <button
              disabled={isStarted || isDisabled}
              onClick={e => {
                e.preventDefault();
                dispatch(setRange());
              }}
              type="button"
            >
              Set range
            </button>
          </Row>
          <Row>
            <button
              disabled={isStarted ? 'disabled' : ''}
              onClick={e => {
                e.preventDefault();
                dispatch(clearAll());
              }}
              type="button"
            >
              Clear All
            </button>
            <button
              disabled={isStarted ? 'disabled' : ''}
              onClick={e => {
                e.preventDefault();
                dispatch(selectAll());
              }}
              type="button"
            >
              Select All
            </button>
          </Row>
        </Section>
        <Slots />
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
