import React from 'react';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './About.css';
import Col from '../../atoms/Col';
import Grid from '../../atoms/Grid';
import Section from '../../molecules/Section';

class About extends React.PureComponent {
  render() {
    return (
      <Grid>
        <Col>
          <Section title="About the application">
            <p className={s.p}>
              This application downloads random sounds from the{' '}
              <a
                href="http://https.freesound.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freesound
              </a>{' '}
              database and transfers them to a connected{' '}
              <a
                href="http://www.korg.com/us/products/dj/volca_sample/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Korg Volca Sample
              </a>.
            </p>
            <p className={s.p} />
            <p className={s.p} />
          </Section>
          <Section title="About myself">
            <p className={s.p}>bla</p>
          </Section>
        </Col>
        <Col>
          <Section title="Acknowledgments">
            <p className={s.p}>
              I started this app to learn the React Javascript framework with
              Redux state management. For this first React project I used
              Kriasoft's React Starter Kit.
            </p>
            <p className={s.p}>
              To convert the audio files to the type of signal the Volca Sample
              uses, I used the syro.js library that Panagiotis Tigas translated
              to Javascript from the original SYRO SDK by Korg.
            </p>
          </Section>
        </Col>
      </Grid>
    );
  }
}

export default compose(withStyles(s))(About);
