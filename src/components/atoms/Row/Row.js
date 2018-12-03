import React from 'react';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Row.css';

class Section extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    hideBottomBorder: PropTypes.bool,
  };

  static defaultProps = {
    hideBottomBorder: false,
  };

  render() {
    const { children, hideBottomBorder } = this.props;
    const style = hideBottomBorder ? { borderBottom: 'none' } : null;
    return (
      <div className={s.root} style={style}>
        {children}
      </div>
    );
  }
}

export default compose(withStyles(s))(Section);
