import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Freesound.css';
import fetchSounds from '../../actions/fetchSounds.actions';
import { setDurationMax } from '../../actions/volca.actions';

class Freesound extends React.Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    durationMax: PropTypes.number.isRequired,
    isStarted: PropTypes.bool.isRequired,
  };

  static defaultProps = {};

  /**
   * When the component mounts:
   * Get the total amount of available sounds from Freesound.
   */
  componentDidMount() {
    this.props.dispatch(
      fetchSounds({
        query: '',
        page: 1,
        pageSize: 1,
      }),
    );
  }

  render() {
    return (
      <div>
        <span className={s.samplecount}>
          {this.props.count > 0
            ? `${this.props.count} samples found`
            : `No samples available.`}
        </span>
        <div className={s.row}>
          <label htmlFor="duration_max">
            <span>Max. duration</span>
            <input
              disabled={this.props.isStarted ? 'disabled' : ''}
              id="duration_max"
              max="none"
              min="0"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setDurationMax(e.target.value));
                this.props.dispatch(
                  fetchSounds({
                    query: '',
                    page: 1,
                    pageSize: 1,
                  }),
                );
              }}
              type="number"
              value={this.props.durationMax}
            />
          </label>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    count: state.sounds.count,
    durationMax: state.sounds.durationMax,
    isStarted: state.sounds.isStarted,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Freesound);
