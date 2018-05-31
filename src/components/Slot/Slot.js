import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { toggleSlot } from '../../actions/volca.actions';
import s from './Slot.css';

class Slot extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isStarted: PropTypes.bool.isRequired,
    status: PropTypes.number.isRequired,
  };

  render() {
    const { dispatch, index, isStarted, status } = this.props;

    return (
      <div className={s.root}>
        <div
          className={s.button}
          data-status={status}
          disabled={isStarted ? 'disabled' : ''}
          onClick={e => {
            e.preventDefault();
            dispatch(toggleSlot(index));
          }}
          onKeyUp={() => null}
          role="button"
          tabIndex={index}
        >
          <div className={s.label}>{index}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isStarted: state.sounds.isStarted,
});

export default compose(withStyles(s), connect(mapStateToProps))(Slot);
