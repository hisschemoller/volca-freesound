import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Slot from '../Slot/Slot';
import s from './Slots.css';

class Slots extends React.Component {
  static propTypes = {
    slotIndex: PropTypes.number.isRequired,
    slots: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  static defaultProps = {};

  render() {
    const { slotIndex, slots } = this.props;
    return (
      <div className={s.root}>
        {slots.map((status, index) => (
          <Slot
            key={index.toString()}
            status={index === slotIndex ? 3 : status}
            index={index}
          />
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    slotIndex: state.sounds.slotIndex,
    slots: state.sounds.slots,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Slots);
