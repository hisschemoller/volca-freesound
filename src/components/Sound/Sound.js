import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Sound.css';
import Row from '../Row';

class Sound extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div>
        <Row>
          <label htmlFor="normalize">
            Normalize
            <input id="normalize" type="checkbox" />
          </label>
        </Row>
        <Row>
          <label htmlFor="doubleSpeed">
            Double speed
            <input id="doubleSpeed" type="checkbox" />
          </label>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Sound);
