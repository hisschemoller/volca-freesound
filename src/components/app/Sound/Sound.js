import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  toggleDoubleSpeed,
  toggleNormalize,
} from '../../../actions/volca.actions';
import s from './Sound.css';
import FormControl from '../../molecules/FormControl';
import Row from '../../atoms/Row';
import Section from '../../molecules/Section';

class Sound extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isDoubleSpeed: PropTypes.bool.isRequired,
    isNormalize: PropTypes.bool.isRequired,
  };

  render() {
    const { dispatch, isDoubleSpeed, isNormalize } = this.props;

    return (
      <Section title="Audio settings">
        <Row>
          <FormControl
            id="normalize"
            label="Normalize"
            type="checkbox"
            onChange={() => {
              dispatch(toggleNormalize());
            }}
            value={isNormalize}
          />
        </Row>
        <Row>
          <FormControl
            id="doubleSpeed"
            label="Double speed"
            type="checkbox"
            onChange={() => {
              dispatch(toggleDoubleSpeed());
            }}
            value={isDoubleSpeed}
          />
        </Row>
      </Section>
    );
  }
}

function mapStateToProps(state) {
  return {
    isDoubleSpeed: state.sounds.isDoubleSpeed,
    isNormalize: state.sounds.isNormalize,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Sound);
