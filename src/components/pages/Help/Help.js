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
              computer's audio output.
            </p>
            <p className={s.p}>
              The app runs in any reasonably modern browser, desktop or mobile,
              as long as the device has a headphone or audio output.
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
              is a musical instrument by Japanese manufacturer{' '}
              <a
                href="http://www.korg.com/us/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Korg
              </a>.
            </p>
            <p className={s.p}>
              It plays audio samples, but it can't record them. Audio files are
              transferred to it from a computer or a mobile device. So it's not
              a sampler in the proper sense of the word, but a sample player.
            </p>
          </Section>
          <Section title="Freesound">
            <p className={s.p}>
              <a
                href="http://https.freesound.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.freesound.org
              </a>{' '}
              is a collaborative audio database where anyone can upload audio
              samples and recordings and share them under Creative Commons
              licenses. It's an initiative of the{' '}
              <a
                href="https://www.upf.edu/web/mtg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Music Technology Group
              </a>{' '}
              of Universitat Pompeu Fabra in Barcelona. More information on
              their{' '}
              <a
                href="https://freesound.org/help/about/"
                target="_blank"
                rel="noopener noreferrer"
              >
                about
              </a>{' '}
              page.
            </p>
            <p className={s.p}>
              Freesound has an API to retrieve information and sounds from their
              database. It's used by this app to find and download sounds.
            </p>
          </Section>
        </Col>
      </Grid>
    );
  }
}

export default compose(withStyles(s))(Help);
