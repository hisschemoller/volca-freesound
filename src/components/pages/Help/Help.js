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
      <div>
        <Grid>
          <Col>
            <Section title="The application">
              <p className={s.p}>
                This app downloads random files from the Freesound audio
                database and transfers them to a Korg Volca Sample connected to
                the computer's audio output.
              </p>
              <p className={s.p}>
                The app runs in any reasonably modern browser, desktop or
                mobile, as long as the device has a headphone or audio output.
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
                is a sample player and sequencer by Japanese manufacturer{' '}
                <a
                  href="http://www.korg.com/us/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Korg
                </a>.
              </p>
              <p className={s.p}>
                It plays audio samples, but it can't record them. Audio files
                are transferred to it from a computer or a mobile device. So
                it's not a sampler in the proper sense of the word, but a sample
                player.
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
                Freesound has an API to retrieve information and sounds from
                their database. It's used by this app to find and download
                sounds.
              </p>
            </Section>
          </Col>
        </Grid>
        <h2 className={s.h2}>Quick start</h2>
        <Grid>
          <Col>
            <Section title="Steps to transfer a sample">
              <ol className={s.ol}>
                <li>Set the computer's volume level close to maximum.</li>
                <li>
                  For a neutral signal make sure any sound effects or equalizers
                  on the computer are switched off.
                </li>
                <li>
                  Connect the computer's audio output to the Volca 'Sync in'
                  input.
                </li>
                <li>Switch on the Volca.</li>
                <li>
                  In the app click the first sample slot, marked '0', to select
                  it.
                </li>
                <li>
                  Press 'Start' on the Volca Freesound page to start the
                  transfer.
                </li>
              </ol>
            </Section>
          </Col>
          <Col>
            <Section title="How to see that things work">
              <ul className={s.ol}>
                <li>In the app the slot that is loading a sample turns red.</li>
                <li>The slot turns green when transfer is done.</li>
                <li>
                  On the Volca Sample the LED display shows the word 'LOAD'.
                </li>
                <li>Various LEDs on the Volca pulsate while transferring.</li>
              </ul>
              <p className={s.p} />
            </Section>
            <Section title="After transfer finishes">
              <ul className={s.ol}>
                <li>
                  On the Volca Sample the PLAY button blinks. Press it to leave
                  transfer mode so you can preview the sample.
                </li>
                <li>The app shows a button to download a receipt text file.</li>
              </ul>
            </Section>
          </Col>
        </Grid>
        <h2 className={s.h2}>Overview</h2>
        <Grid>
          <Col>
            <Section title="" />
          </Col>
          <Col>
            <Section title="" />
          </Col>
        </Grid>
      </div>
    );
  }
}

export default compose(withStyles(s))(Help);
