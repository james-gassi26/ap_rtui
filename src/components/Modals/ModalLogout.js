import React ,{ useContext }from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { LanguageContext } from '../../LanguageContext';


function ModalLogout(props) {
    const { translations } = useContext(LanguageContext);
    const { onHide } = props;

    const handleSignOut = (event) => {
        localStorage.removeItem("userAccID");
        localStorage.removeItem("portal");
        window.location.reload(true);
    };

    return (
        <Modal
            {...props}
            size="md"
            animation={true}
            aria-labelledby="logout-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="logout-modal-title">{translations.signOutTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{translations.sureSignOut}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSignOut} variant="danger">{translations.yes}</Button>
                <Button onClick={onHide} variant="secondary">{translations.close}</Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalLogout.propTypes = {
    onHide: PropTypes.func.isRequired,
}

export default ModalLogout;

