import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Sound.css';
import FormControl from '../FormControl';
import Row from '../Row';

class Sound extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div>
        <Row>
          <FormControl id="normalize" label="Normalize" type="checkbox" />
        </Row>
        <Row>
          <FormControl id="doubleSpeed" label="Double speed" type="checkbox" />
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Sound);
