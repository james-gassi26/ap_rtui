import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Button, Container, Form, Navbar, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoNote, GoSignOut, GoScreenFull } from 'react-icons/go';

import { API } from '../../api';

import logo from "../../assets/images/ap_logo_200x50.png"
//COMPONENTS
import ModalLogout from "../../components/Modals/ModalLogout";
import { ErrMsg, InfoMsg } from '../../components/AlertMsg/AlertMsg';
//UTILITY
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage'
import { savedPortal, localStoreUserAccID, localStoreBranchID } from '../../utilities/LocalStorageItems'

//translation
import { LanguageContext } from '../../LanguageContext';

function SelectPortal(props) {
    const { onSelect, chkportal } = props;

    const { translations } = useContext(LanguageContext);
    const [portals, setPortals] = useState([]);
    const [modalLogOutShow, setModalLogOutShow] = useState(false);

    const getAllPortals = async () => {
        try {
            const response = await API.get(`api/tbl_locatorreader/getalliereaderbranched?userAccID=${localStoreUserAccID}&&branchID=${localStoreBranchID}`);
            if (response.status === 200) {
                if (response.data.code === 1) {
                    setPortals(response.data.document);
                    //to check if the saved portal in localStorage is still existing in database
                    chkportal(response.data.document); 
                } else {
                    toast.info(<InfoMsg msg={translations.noReg} />, {
                        toastId: "no-registered-portals"
                    });
                }
            }
        } catch (err) {
            if (String(err).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetPortals', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errGetPortals', JSON.stringify(`${Date().toLocaleString()} ${err}`));
                toast.error(<ErrMsg msg={translations.portalList} err={String(err)} />, {
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

    const reqFullScreen = () => {
        document.documentElement.requestFullscreen();
    };

    const openDashboard = () => {
        sessionStorage.setItem("redirectTo", "/dashboard");
        window.open("/dashboard", "_blank");
    };

    if (savedPortal) {
        handleClickDropDown();
    };

    return (
        <Navbar expand="lg" variant="light" bg="light" sticky="top" className='border-bottom'>
            <Container className="pl-0" fluid>
                <Navbar.Brand href={window.Configs.home_url} className="ml-0">
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id="button-tooltip">Back to Ingress/Egress</Tooltip>}
                    >
                        <Image src={logo} width="200px" height="50px" />
                    </OverlayTrigger>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text className="mr-2">
                        <Form.Group controlId="exampleForm.ControlSelect1" className="pb-0 mb-0" style={{minWidth: "700px", maxWidth: "700px"}}>
                            <Form.Control
                                placeholder="Select Portal"
                                as="select"
                                value={savedPortal ? savedPortal : "Select Portal"}
                                onClick={handleClickDropDown}
                                onChange={onSelect}
                            >
                                <option value="Select Portal">{translations.select}</option>
                                {portals.length === 0 && <option value="Select Portal">Loading...</option>}
                                {portals.map((portal, idx) =>
                                    <option key={idx} value={portal.readerIP}>{portal.description}</option>
                                )}
                            </Form.Control>
                        </Form.Group>
                    </Navbar.Text>
                    <Navbar.Text className="mr-2 pb-3">
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">{translations.dashboard}</Tooltip>}
                        >
                            <Button variant="outline-secondary" className="border-0 rounded-circle" onClick={openDashboard}><GoNote size="22px" /></Button>
                        </OverlayTrigger>
                    </Navbar.Text>
                    <Navbar.Text className="mr-2 pb-3">
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">{translations.fullscreen}</Tooltip>}
                        >
                            <Button variant="outline-secondary" className="border-0 rounded-circle" onClick={reqFullScreen}><GoScreenFull size="22px" /></Button>
                        </OverlayTrigger>
                    </Navbar.Text>
                    <Navbar.Text className="mr-2 pb-3">
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">{translations.signOut}</Tooltip>}
                        >
                            <Button variant="outline-danger" className="border-0 rounded-circle" onClick={() => setModalLogOutShow(true)}><GoSignOut size="22px" /></Button>
                        </OverlayTrigger>
                    </Navbar.Text>
                </Navbar.Collapse>
                <ModalLogout
                    show={modalLogOutShow}
                    onHide={() => setModalLogOutShow(false)}
                />
            </Container>
         </Navbar>
        // <div className="pt-3 pb-1 pl-2 pr-3 border-bottom bg-white">
        //     <Row>
        //         <Col xs={12} sm={12} md={4} lg={6}>
        //             <OverlayTrigger
        //                 placement="bottom"
        //                 delay={{ show: 250, hide: 400 }}
        //                 overlay={<Tooltip id="button-tooltip">Go to Home Page</Tooltip>}
        //             >
        //                 <Image src={logo} height="50px" width="200px" onClick={() => window.location.assign(window.Configs.home_url)} />
        //             </OverlayTrigger>
        //         </Col>
        //         <Col xs={12} sm={12} md={8} lg={3} xl={4}>
        //             <Form.Group controlId="exampleForm.ControlSelect1">
        //                 <Form.Control
        //                     placeholder="Select Portal"
        //                     as="select"
        //                     value={savedPortal ? savedPortal : "Select Portal"}
        //                     onClick={handleClickDropDown}
        //                     onChange={onSelect}
        //                 >
        //                     <option value="Select Portal">Select Portal</option>
        //                     {portals.length === 0 && <option value="Select Portal">Loading...</option>}
        //                     {portals.map((portal, idx) =>
        //                         <option key={idx} value={portal.readerIP}>{portal.description}</option>
        //                     )}
        //                 </Form.Control>
        //             </Form.Group>
        //         </Col>
        //         <Col xs={12} sm={12} md={8} lg={3} xl={2}>
        //             <div className="d-flex ">
        //                 <div className="ml-2">
        //                     <OverlayTrigger
        //                         placement="bottom"
        //                         delay={{ show: 250, hide: 400 }}
        //                         overlay={<Tooltip id="button-tooltip">Dashboard Monitoring</Tooltip>}
        //                     >
        //                         <Button variant="outline-secondary" className="border-0 rounded-circle" onClick={openDashboard}><GoNote size="22px" /></Button>
        //                     </OverlayTrigger>
        //                 </div>
        //                 <div className="ml-2">
        //                     <OverlayTrigger
        //                         placement="bottom"
        //                         delay={{ show: 250, hide: 400 }}
        //                         overlay={<Tooltip id="button-tooltip">Fullscreen</Tooltip>}
        //                     >
        //                         <Button variant="outline-secondary" className="border-0 rounded-circle" onClick={reqFullScreen}><GoScreenFull size="22px" /></Button>
        //                     </OverlayTrigger>
        //                 </div>
        //                 <div className="ml-2">
        //                     <OverlayTrigger
        //                         placement="bottom"
        //                         delay={{ show: 250, hide: 400 }}
        //                         overlay={<Tooltip id="button-tooltip">Sign Out?</Tooltip>}
        //                     >
        //                         <Button variant="outline-danger" className="border-0 rounded-circle" onClick={() => setModalLogOutShow(true)}><GoSignOut size="22px" /></Button>
        //                     </OverlayTrigger>
        //                 </div>
        //             </div>
        //         </Col>
        //     </Row>
        // </div>
        
    );
}

export default SelectPortal;