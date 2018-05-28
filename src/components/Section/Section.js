import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Section.css';

class Section extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
  };

  render() {
    const { children, title } = this.props;
    return (
      <div className={s.root}>
        <h2 className={s.header}>{title}</h2>
        {children}
      </div>
    );
  }
}

export default compose(withStyles(s))(Section);
