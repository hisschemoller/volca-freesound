import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Sound.css';

class Sound extends React.Component {
  static propTypes = {};

  render() {
    return <div />;
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Sound);
