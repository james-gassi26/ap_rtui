import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Col, Form, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoSignOut } from 'react-icons/go';
// import { HiSwitchHorizontal } from 'react-icons/hi'

import { API } from '../../api';

//COMPONENTS
import ModalLogout from "../../components/Modals/ModalLogout";
import { ErrMsg, InfoMsg } from '../../components/AlertMsg/AlertMsg';
//UTILITY
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage'

function SelectPortal(props) {
    const { onSelect, chkportal } = props;
    const token = JSON.parse(localStorage.getItem('token'));
    const savedPortal = JSON.parse(localStorage.getItem('portal'));

    const [portals, setPortals] = useState([]);
    const [modalLogOutShow, setModalLogOutShow] = useState(false);

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const getAllPortals = async () => {
        try {
            const response = await API.get("api/tbl_locatorreader/getalliereader", config);
            if (response.status === 200) {
                if (response.data.code === 1) {
                    setPortals(response.data.document);
                    chkportal(response.data.document); //to check if the saved portal in localStorage is still existing in database
                } else {
                    toast.info(<InfoMsg msg="No registered portals yet" />);
                }
            }
        } catch (err) {
            if (String(err).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetPortals', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errGetPortals', JSON.stringify(`${Date().toLocaleString()} ${err}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred In Getting List of Portals!" err={String(err)} />, {
                    toastId: "toast-error-portals"
                });
            }
        }
    };

    const handleClickDropDown = (event) => {
        if (portals.length === 0) {
            getAllPortals();
        }
    };

    if (savedPortal) {
        handleClickDropDown();
    };

    return (
        <div className="pt-3 pb-0 pl-2 pr-3 border-bottom bg-white">
            <Row>
                {/* <Col xs={12} sm={12} md={4} lg={6} className="pl-0 pb-2">
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id="button-tooltip">Go to Home Page</Tooltip>}
                    >
                        <Image src={logo} height="45px" width="200px" onClick={() => window.location.assign(window.Configs.home_url)} />
                    </OverlayTrigger>
                </Col> */}
                <Col xs={12} sm={12} md={8} lg={3} xl={6}>
                    <div className="d-flex">
                        <Form.Group controlId="exampleForm.ControlSelect1" className='w-100'>
                            <Form.Control
                                placeholder="Select Portal"
                                as="select"
                                size="sm"
                                value={savedPortal ? savedPortal : "Select Portal"}
                                onClick={handleClickDropDown}
                                onChange={onSelect}
                            >
                                <option value="Select Portal">Select Portal</option>
                                {portals.length === 0 && <option value="Select Portal">Loading...</option>}
                                {portals.map((portal, idx) =>
                                    <option key={idx} value={portal.readerIP}>{portal.description}</option>
                                )}
                            </Form.Control>
                        </Form.Group>
                        <div className="d-flex">
                            {/* <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">Switch Realtime Table</Tooltip>}
                            >
                                <HiSwitchHorizontal size="20px" className="text-success mt-2 ml-2" onClick={() => setModalLogOutShow(true)}/>
                            </OverlayTrigger> */}
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">Sign Out?</Tooltip>}
                            >
                                <GoSignOut size="20px" className="text-danger mt-2 ml-2" onClick={() => setModalLogOutShow(true)}/>
                            </OverlayTrigger>
                        </div>
                    </div>
                </Col>
            </Row>
            <ModalLogout
                show={modalLogOutShow}
                onHide={() => setModalLogOutShow(false)}
            />
        </div>
    );
}

export default SelectPortal;