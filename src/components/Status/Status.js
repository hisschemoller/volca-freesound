import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Status.css';

class Status extends React.Component {
  static propTypes = {};

  static defaultProps = {};

  render() {
    const {} = this.props;
    return <span>to be continued</span>;
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Status);
