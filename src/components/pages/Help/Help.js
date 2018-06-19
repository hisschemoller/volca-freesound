import React from 'react';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Help.css';
import Col from '../../atoms/Col';
import Grid from '../../atoms/Grid';
import Section from '../../molecules/Section';

class Help extends React.PureComponent {
  render() {
    return (
      <Grid>
        <Col>
          <Section title="The application">
            <p className={s.p}>
              This app downloads random files from the Freesound audio database
              and transfers them to a Korg Volca Sample connected to the
              computer's audio output. The app runs in any reasonably modern
              browser, desktop or mobile, as long as the device has a headphone
              or audio output. Please find the Volca Freesound app here:
            </p>
            <p className={s.p} />
            <p className={s.p} />
          </Section>
        </Col>
        <Col>
          <Section title="Korg Volca Sample">
            <p className={s.p}>
              The Korg{' '}
              <a
                href="http://www.korg.com/us/products/dj/volca_sample/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Volca Sample
              </a>{' '}
              musical instrument by Japanese electronic instrument maker{' '}
              <a
                href="http://www.korg.com/us/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Korg
              </a>{' '}
              that plays audio samples. The unusual thing about the Volca Sample
              is that it can't record sound. So it's not a sampler in the proper
              sense of the word, but a sample player. Samples must be
              transferred with a dedicated computer application.
            </p>
          </Section>
          <Section title="Freesound">
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

export default compose(withStyles(s))(Help);
