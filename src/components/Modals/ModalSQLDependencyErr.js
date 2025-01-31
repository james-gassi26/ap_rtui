import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Button, Modal } from 'react-bootstrap';

function ModalSQLDependecyErr({show, setShow, isCritical, errMsg}) {
    const [timer, setTimer] = useState(10);
    const [stopTimer, setStopTimer] = useState(false);

    useEffect(() => {
        let timeout;

        if(show && !stopTimer) {
            if(timer === 0) {
                handleClose();
                // window.location.reload();
            } else {
                // start timer. From 10 to 0
                timeout = setTimeout(() => {
                    setTimer(previous => previous - 1);
                }, 1000);
            }

            return () => clearTimeout(timeout);
        }
    // eslint-disable-next-line
    }, [timer, show, stopTimer])

    const handleClose = () => {
        sessionStorage.setItem("reloadCounter", 0);
        setShow((prev) => ({...prev, show: false}));
    };

    const handleStopTimer = () => {
        setStopTimer(true);
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            size="md"
        >
            <Modal.Header 
                className={clsx("text-white", {
                    "bg-danger": isCritical,
                    "bg-warning": !isCritical
                })}
            >
                <Modal.Title>Error!</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <span 
                    className={clsx("font-weight-bold", {
                        "text-danger": isCritical,
                        "text-warning": !isCritical
                    })}
                >
                    Error happened: {errMsg}...
                </span>
                
                <center className="mt-4">
                    Page will reload once timer reached 0
                    <div className="my-5">
                        <h1>
                            <span 
                                className={clsx("rounded-circle text-white py-4", {
                                    "bg-danger": isCritical,
                                    "bg-warning": !isCritical
                                })}

                                style={{
                                    paddingRight: timer === 10 ? "2.25rem" : "3rem",
                                    paddingLeft: timer === 10 ? "2.25rem" : "3rem"
                                }}
                            >
                                {timer}
                            </span>
                        </h1>
                    </div>
                </center>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={handleClose}
                >
                    Close
                </Button>
                <Button 
                    variant={isCritical ? "danger" : "warning"} 
                    className="text-white"
                    disabled={stopTimer}
                    onClick={handleStopTimer}
                >
                    Stop
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalSQLDependecyErr.propTypes = {
    show: PropTypes.bool.isRequired,
    isCritical: PropTypes.bool.isRequired,
    errMsg: PropTypes.string.isRequired
}

export default ModalSQLDependecyErr;
