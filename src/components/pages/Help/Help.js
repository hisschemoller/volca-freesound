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
                the computer&apos;s audio output.
              </p>
              <p className={s.p}>
                The app runs in any reasonably modern browser, desktop or
                mobile, as long as the device has a headphone or audio output.
              </p>
              <p className={s.p} />
              <p className={s.p} />
            </Section>
            <Section title="Sample licenses">
              <p className={s.p}>
                Please be aware that Freesound samples have different licenses
                depending on the uploader&apos;s choice. After transfer finishes
                the app presents a receipt, a text file to download that
                contains license information and links to the sounds on the
                Freesound website.
              </p>
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
                It plays audio samples, but it can&apos;t record them. Audio
                files are transferred to it from a computer or a mobile device.
                So it&apos;s not a sampler in the proper sense of the word, but
                a sample player.
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
                licenses. It&apos;s an initiative of the{' '}
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
                their database. It&apos;s used by this app to find and download
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
                <li>Set the computer&apos;s volume level close to maximum.</li>
                <li>
                  For a neutral signal make sure any sound effects or equalizers
                  on the computer are switched off.
                </li>
                <li>
                  Connect the computer&apos;s audio output to the Volca
                  &apos;Sync in&apos; input.
                </li>
                <li>Switch on the Volca.</li>
                <li>
                  In the app click the first sample slot, marked &apos;0&apos;,
                  to select it.
                </li>
                <li>
                  Press &apos;Start&apos; on the Volca Freesound page to start
                  the transfer.
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
                  On the Volca Sample the LED display shows the word
                  &apos;LOAD&apos;.
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
            <Section title="">
              <p className={s.p}>
                The Volca Sample has 4MB memory that can hold a maximum of 100
                samples.
              </p>
              <p className={s.p}>
                Any number of the 100 slots can be selected to receive a sample.
                Because of the Volca&apos;s small memory size, a maximum sample
                length can be set.
              </p>
              <p className={s.p}>
                The app&apos;s screen is divided in 4 sections:
              </p>
              <ul className={s.ol}>
                <li>
                  <i>Freesound settings</i> - Settings for the random sounds
                  from freesound.org
                </li>
                <li>
                  <i>Audio settings</i> - Change the audio files after they have
                  been downloaded from Freesound.
                </li>
                <li>
                  <i>Slot selection</i> - Which of the slots on the Volca Sample
                  will receive new samples.
                </li>
                <li>
                  <i>File transfer</i> - Starts and stops the download and
                  transfer process.
                </li>
              </ul>
              <p className={s.p}>
                Samples are transferred to the Volca using an old MODEM type
                signal. So once the app has downloaded an audio file from
                freesound.org, it&apos;s first converted inside the app. You can
                hear the signal if you start the app without the audio output
                being connected to a Volca. PLEASE NOTE: listen at low volume,
                because the the signal starts with a loud, high pitched beep.
              </p>
              <p className={s.p}>
                Some remarks on sample transfer and tips for best results:
              </p>
              <ul className={s.ol}>
                <li>
                  Transfer is quite slow. You can expect it to take about 13
                  times as long as a sample&apos;s duration.
                </li>
                <li>
                  The computer&apos;s audio output is best set at - or close to
                  maximum volume.
                </li>
                <li>
                  Use fresh batteries or a power adapter for more reliable
                  transfer.
                </li>
                <li>
                  My own experience is that transfer is never very reliable. An
                  error will occur after 10 or 20 samples, even with the Volca
                  on a power adapter, a good quality soundcard and audio cable,
                  and carefully set volume level.
                </li>
              </ul>
            </Section>
          </Col>
          <Col>
            <Section title="Freesound settings">
              <p className={s.p}>
                Set <i>Max. duration</i> to limit the maximum length in seconds
                of the samples that are downloaded from the Freesound database.
                The number of available samples is shown underneath.
              </p>
            </Section>
            <Section title="Audio settings">
              <p className={s.p}>
                <i>Normalize</i> maximizes each sample&apos;s volume before
                transfer.
              </p>
              <p className={s.p}>
                <i>Double speed</i> doubles each sample&apos;s playback speed,
                so they use half the memory on the Volca and twice as much
                sample time can be used. The samples must be pitched down 12
                steps, one octave, to play them back at their original speed.
              </p>
            </Section>
            <Section title="File transfer">
              <p className={s.p}>
                Click <i>Start</i> to start the download and transfer process.
                When finished a receipt button will appear to download a text
                file containing license and other information of the transferred
                samples.
              </p>
            </Section>
            <Section title="Volca Sample slot selection">
              <p className={s.p}>
                Initally no slots are selected. There are several ways to select
                them:
              </p>
              <ul className={s.ol}>
                <li>
                  Click individual slots in the grid to select or deselect them.
                </li>
                <li>
                  Click &apos;Clear all&apos; or &apos;Select all&apos; to clear
                  or select all 100 slots.
                </li>
                <li>
                  Select a range of samples by setting the &apos;From&apos; and
                  &apos;To&apos; fields and clicking the &apos;Set range&apos;
                  button.
                </li>
              </ul>
            </Section>
          </Col>
        </Grid>
      </div>
    );
  }
}

export default compose(withStyles(s))(Help);
