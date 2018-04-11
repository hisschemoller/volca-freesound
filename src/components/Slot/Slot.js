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
    status: PropTypes.number.isRequired,
  };

  render() {
    return (
      <button
        type="button"
        className={s.root}
        data-status={this.props.status}
        onClick={e => {
          e.preventDefault();
          this.props.dispatch(toggleSlot(this.props.index));
        }}
      >
        {this.props.index}
      </button>
    );
  }
}

const mapStateToProps = () => ({
  // slot: getItemByKey(ownProps.uniqueKey)
});

export default compose(withStyles(s), connect(mapStateToProps))(Slot);
