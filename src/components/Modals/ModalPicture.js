import React from 'react';
import PropTypes from 'prop-types';
import { Button, Image, Modal } from 'react-bootstrap';

function ModalPicture(props) {
    const { onHide, title, picture } = props;

    return (
        <Modal
            {...props}
            size="md"
            animation={true}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {picture 
                    ? <center><Image src={`data:image/jpeg;base64,${picture}`} height="300px" width="300px" fluid/></center>
                    : <p className="text-center">No Picture Available</p>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalPicture.propTypes = {
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    picture: PropTypes.string
}

export default ModalPicture;

