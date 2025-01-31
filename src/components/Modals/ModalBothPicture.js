import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Image, Modal, Row } from 'react-bootstrap';

function ModalBothPicture(props) {
    const { show, onHide, title, personnelpicture, assetPicture, rfids } = props;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            animation={true}
            backdrop="static"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="h-50">
                <Row>
                    <Col xs="12" sm="12" md="6" className="border-right py-3">
                        {assetPicture 
                            ? <center>
                                <Image src={`data:image/jpeg;base64,${assetPicture}`} height="300px" width="300px"/>
                                <p className="text-center">{rfids[0]}</p>
                              </center>
                            : <p className="text-center">No Asset Picture Available</p>
                        }
                    </Col>

                    <Col xs="12" sm="12" md="6" className="py-3">
                        {personnelpicture ? (
                            <center>
                                <Image src={`data:image/jpeg;base64,${personnelpicture}`} height="300px" width="300px"/>
                                <p className="text-center">{rfids[1]}</p>
                            </center>
                        ) : (<p className="text-center">No Personnel Picture Available</p>)
                        }
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalBothPicture.propTypes = {
    onHide: PropTypes.func.isRequired,
    personnelpicture: PropTypes.string,
    assetPicture: PropTypes.string,
    rfids: PropTypes.array
}

export default ModalBothPicture;

