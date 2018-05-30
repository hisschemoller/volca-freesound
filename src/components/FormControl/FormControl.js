import React from 'react';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FormControl.css';

class FormControl extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.oneOf([`checkbox`, `number`, `text`]),
  };

  static defaultProps = {
    id: null,
    label: 'label',
    type: `input`,
  };

  render() {
    const { label, id, type, ...props } = this.props;

    return (
      <label htmlFor={id} className={s.label}>
        <input type={type} id={id} className={s.input} {...props} />
        <span>{label}</span>
      </label>
    );
  }
}

export default compose(withStyles(s))(FormControl);
