/**
 * Container for all modals and dialogs.
 * @see https://medium.com/@danparkk/react-modals-scalable-customizable-neat-components-f2088d60f3d3
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ModalUnlockIOSAudio from '../ModalUnlockIOSAudio';
import { MODAL_UNLOCK_IOS_AUDIO } from '../../constants/modaltypes';

class ModalContainer extends React.PureComponent {
  static propTypes = {
    modalType: PropTypes.string,
  };

  static defaultProps = {
    modalType: null,
  };

  static MODAL_COMPONENTS = {
    [MODAL_UNLOCK_IOS_AUDIO]: ModalUnlockIOSAudio,
  };

  render() {
    const { modalType, ...rest } = this.props;

    if (!modalType) {
      return null;
    }

    const SpecificModal = ModalContainer.MODAL_COMPONENTS[modalType];

    return <SpecificModal {...rest} />;
  }
}

const mapStateToProps = state => ({
  modalType: state.sounds.modalType,
});

export default connect(mapStateToProps)(ModalContainer);
