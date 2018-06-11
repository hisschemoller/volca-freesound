/**
 * Volca Freesound app.
 *
 * 1. load sound data
 * 1a. update view
 * 2. load mp3
 * 2a. update view
 * 3. convert audio
 * 3a. update view
 * 4. transfer
 * 4a. update view while transferring
 * 5. done transferring
 *
 * 1. Initially all slots are selected.
 * 2. Range selectors adjust the range from first to last slot.
 * 3. All and Clear buttons to select all or no slots.
 * 4. Slots are clickable to toggle individual slots.
 * 5. Click and drag to select multiple slots.
 */

import React from 'react';
import compose from 'recompose/compose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Main.css';
import Freesound from '../Freesound';
import Sound from '../Sound';
import Transfer from '../Transfer';
import Volca from '../Volca';

class Main extends React.PureComponent {

  render() {
    return (
      <div className={s.root}>
        <div className={s.grid}>
          <div className={s.grid__column}>
            <Freesound />
            <Sound />
            <Transfer />
          </div>
          <div className={s.grid__column}>
            <Volca />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(withStyles(s))(Main);
