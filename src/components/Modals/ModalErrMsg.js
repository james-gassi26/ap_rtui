import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

function ModalErrMsg({show, setShow, errMsg}) {

    const handleClose = () => setShow(false);

    const restartPage = () => {
        sessionStorage.setItem("reloadCounter", 0);
        window.location.reload();
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            size="md"
            centered
        >
            <Modal.Header className="text-white bg-danger py-1">
                <Modal.Title>Error!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <strong>System detected a continuous error!</strong>
                </div>
                <center>
                    <span className="font-weight-bold text-danger">
                        {errMsg}...
                    </span>
                </center>
            </Modal.Body>
            <Modal.Footer className="py-1">
                <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={restartPage}
                >
                    Reload Page
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalErrMsg.propTypes = {
    show: PropTypes.bool.isRequired,
    errMsg: PropTypes.string.isRequired
}

export default ModalErrMsg;
