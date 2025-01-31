import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, InputGroup, Modal } from 'react-bootstrap';

function ModalValidationConfig(props) {
    const { onHide } = props;

    return (
        <Modal
            {...props}
            size="md"
            animation={true}
            backdrop="static"
            aria-labelledby="validation-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="validation-modal-title">Validation Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <p>Set time duration of asset-assignee validation (in sec).</p>
                    <InputGroup className="border rounded w-75">
                        <FormControl aria-label="in seconds" className="border-0" type="number"/>
                        <InputGroup.Text className="border-left border-top-0 border-right-0 border-bottom-0 rounded-0">seconds</InputGroup.Text>
                    </InputGroup>
                    <p className="mt-3">Set time duration before it disappear on display (in sec).</p>
                    <InputGroup className="border rounded w-75">
                        <FormControl aria-label="in seconds" className="border-0" type="number"/>
                        <InputGroup.Text className="border-left border-top-0 border-right-0 border-bottom-0 rounded-0">seconds</InputGroup.Text>
                    </InputGroup>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>Apply Settings</Button>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalValidationConfig.propTypes = {
    onHide: PropTypes.func.isRequired,
}

export default ModalValidationConfig;

