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
              Download random sounds from the{' '}
              <a
                href="http://https.freesound.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Freesound
              </a>{' '}
              database and transfer them to a connected{' '}
              <a
                href="http://www.korg.com/us/products/dj/volca_sample/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Korg Volca Sample
              </a>.
            </p>
            <p className={s.p}>
              If you use a Korg Volca Sample and want some new sounds on it,
              surprise yourself and fill its memory with a collection of random
              samples.
            </p>
            <p className={s.p}>
              Source files:<br />
              <a
                href="https://github.com/hisschemoller/volca-freesound"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/hisschemoller/volca-freesound
              </a>
            </p>
            <p className={s.p} />
          </Section>
          <Section title="About myself">
            <p className={s.p}>
              I&apos;m a frontend developer from Amsterdam, the Netherlands. I&apos;m
              interested in electronic music and like to try to combine coding
              and making music.{' '}
            </p>
            <p className={s.p}>
              <a
                href="http://www.soundcloud.com/hisschemoller"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.soundcloud.com/hisschemoller
              </a>
            </p>
          </Section>
        </Col>
        <Col>
          <Section title="Acknowledgments">
            <p className={s.p}>
              This app started as a project for me to learn and get some
              experience with the React Javascript framework and Redux state
              management. I used Kriasofts React Starter Kit as a basis for
              this project.
            </p>
            <p className={s.p}>
              <a
                href="https://reactjs.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                reactjs.org
              </a>
              <br />
              <a
                href="https://redux.js.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                redux.js.org
              </a>
              <br />
              <a
                href="https://github.com/kriasoft/react-starter-kit"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/kriasoft/react-starter-kit
              </a>
            </p>
            <p className={s.p}>
              To convert audio to the Volca Sample modem transfer signal, I used
              the syro.js library by Panagiotis Tigas, translated to Javascript
              from the original SYRO SDK by Korg.
            </p>
            <p className={s.p}>
              <a
                href="https://github.com/ptigas/syro.js"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/ptigas/syro.js
              </a>
              <br />
              <a
                href="http://korginc.github.io/volcasample/"
                target="_blank"
                rel="noopener noreferrer"
              >
                korginc.github.io/volcasample
              </a>
            </p>
            <p className={s.p}>
              The Freesound audio database has an API to select sounds and
              provides preview MP3 files that are downloaded by this app to
              transfer to the Volca Sample.
            </p>
            <p className={s.p}>
              <a
                href="https://freesound.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                freesound.org
              </a>
              <br />
              <a
                href="https://freesound.org/help/developers/"
                target="_blank"
                rel="noopener noreferrer"
              >
                freesound.org/help/developers
              </a>
            </p>
          </Section>
        </Col>
      </Grid>
    );
  }
}

export default compose(withStyles(s))(About);
