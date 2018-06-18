import React from 'react';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './About.css';
import Col from '../Col';
import Grid from '../Grid';
import Row from '../Row';
import Section from '../Section';

class About extends React.PureComponent {
  render() {
    return (
      <Grid>
        <Col>
          <Section title="About">
            <Row>About</Row>
          </Section>
        </Col>
        <Col />
      </Grid>
    );
  }
}

export default compose(withStyles(s))(About);
