import React from 'react';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Row.css';

class Section extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children } = this.props;
    return <div className={s.root}>{children}</div>;
  }
}

export default compose(withStyles(s))(Section);
