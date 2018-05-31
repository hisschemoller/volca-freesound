import React from 'react';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FormControl.css';

class FormControl extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    type: PropTypes.oneOf([`checkbox`, `number`, `text`]),
    value: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number,
      PropTypes.string,
    ]),
  };

  static defaultProps = {
    id: null,
    label: 'label',
    onChange: null,
    type: 'input',
    value: '',
  };

  render() {
    const { label, id, type, value, ...props } = this.props;

    if (type === 'checkbox') {
      return (
        <label htmlFor={id} className={s.label}>
          <input
            type={type}
            id={id}
            checked={value}
            className={s.input}
            onChange={props.onChange}
            {...props}
          />
          <span>{label}</span>
        </label>
      );
    }

    return (
      <label htmlFor={id} className={s.label}>
        <input
          type={type}
          id={id}
          checked={value}
          className={s.input}
          onChange={props.onChange}
          value={value}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  }
}

export default compose(withStyles(s))(FormControl);
