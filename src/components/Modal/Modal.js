import React from 'react';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Modal.css';

class Modal extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this.props.onClose) {
      window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      window.removeEventListener(
        'keydown',
        this.listenKeyboard.bind(this),
        true,
      );
    }
  }

  listenKeyboard(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.props.onClose();
    }
  }

  render() {
    const { children, onClose } = this.props;

    return (
      <div>
        <div className={s.overlay} />
        <div
          className={s.content}
          onClick={() => {
            onClose();
          }}
          onKeyUp={e => {
            this.listenKeyboard(e);
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className={s.dialog}
            onClick={e => {
              e.stopPropagation();
            }}
            onKeyUp={() => null}
            role="button"
            tabIndex={0}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default compose(withStyles(s))(Modal);
