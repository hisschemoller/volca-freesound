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
    return (
      <button
        className={s.root}
        data-status={this.props.status}
        disabled={this.props.isStarted ? 'disabled' : ''}
        onClick={e => {
          e.preventDefault();
          this.props.dispatch(toggleSlot(this.props.index));
        }}
        type="button"
      >
        {this.props.index}
      </button>
    );
  }
}

const mapStateToProps = state => ({
  isStarted: state.sounds.isStarted,
});

export default compose(withStyles(s), connect(mapStateToProps))(Slot);
