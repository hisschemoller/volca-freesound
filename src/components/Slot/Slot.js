import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slot.css';

class Slot extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    status: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className={s.root} data-status={this.props.status}>
        {this.props.index}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  // slot: getItemByKey(ownProps.uniqueKey)
})

export default compose(withStyles(s), connect(mapStateToProps))(Slot);
