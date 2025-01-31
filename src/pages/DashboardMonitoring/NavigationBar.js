import React, { useEffect, useState, useContext } from 'react';
import { Button, Container, Image, Navbar, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TiHome } from "react-icons/ti";
import { IoMdListBox } from 'react-icons/io';
import { GoScreenFull, GoSignOut } from 'react-icons/go';
import { BiMessageEdit } from 'react-icons/bi';
import { toast } from 'react-toastify';

//assets
import logo from "../../assets/images/ap_logo_200x50.png"

//components
import ModalValidationConfig from '../../components/Modals/ModalValidationConfig';
import ModalReport from '../../components/Modals/ModalReport';
import ModalNotiSettings from '../../components/Modals/ModalNotiSettings';
import ModalLogout from '../../components/Modals/ModalLogout';
import { ErrMsg, InfoMsg } from '../../components/AlertMsg/AlertMsg';

//utilities
import { localStoreUserAccID, localStoreBranchID } from '../../utilities/LocalStorageItems';
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage';

//API
import { API } from '../../api';

//language
import { LanguageContext } from '../../LanguageContext';

export default function NavigationBar({selectedBranchID, setSelectedBranchID, searchRight, notiMsgRight, importExportRight}) {
    const [openValidationSettings, setOpenValidationSettings] = useState(false);
    const [openReport, setOpenReport] = useState(false);
    const [openNotificationSettins, setOpenNotificationSettins] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("Default Branch");
    const [openLogOut, setOpenLogOut] = useState(false);
    const { translations } = useContext(LanguageContext);

    useEffect(() => {
        getAllBranches();
    // eslint-disable-next-line
    }, [])

    const getAllBranches = async () => {
        try {
            const response =  await API.get(`api/tbl_branch/getalltblbranch?userAccID=${localStoreUserAccID}&branchID=${localStoreBranchID}`);
            if(response.status === 200 && response.data.code === 1){
                setBranches(response.data.document);
                const findselectedBranch = response.data.document.find(({branchID}) => branchID === selectedBranchID);
                if(findselectedBranch !== undefined) {
                    setSelectedBranch(findselectedBranch.branch);
                    toast.info(<InfoMsg msg={`${translations.curr} ${findselectedBranch.branch}`} />, {
                        toastId: "toast-selected-branch"
                    });
                } else {
                    toast.error(<ErrMsg msg={translations.selectBranch} />, {
                        toastId: "toast-error-401"
                    });
                }
            } else {
                setBranches([]);
                toast.info(<InfoMsg msg={translations.noBranch}/>);
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetBranches', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errGetBranches', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg={translations.branches} err={String(error)} />, {
                    toastId: "toast-error-branches"
                });
            }
        }
    };

    const handleClickDropDown = (event) => {
        if (branches.length === 0) {
            getAllBranches();
        }
    };

    const handleSelectBranch = (id, name) => {
        setSelectedBranchID(id);
        setSelectedBranch(name);
        sessionStorage.setItem("selectedBranchID", id);
        window.location.reload(true);
    };

    const reqFullScreen = () => {
        document.documentElement.requestFullscreen();
    };

    const handleOpenReport = () => {
        if(searchRight.allowed === true){
            setOpenReport(true);
        }
        else {
            toast.error(<ErrMsg msg={translations.permit} />, {
                toastId: "toast-error-403"
            });
        } 
    };

    const handleOpenNotiMsg = () => {
        if(notiMsgRight.allowed === true){
            setOpenNotificationSettins(true);
        }
        else {
            toast.error(<ErrMsg msg={translations.permit} />, {
                toastId: "toast-error-403"
            });
        } 
    };

    return (
        <React.Fragment>
            <Navbar expand="lg" variant="light" bg="light" sticky="top">
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
                        <NavDropdown title={selectedBranch} id="collapsible-branch-nav-dropdown" className="overflow-scroll" onClick={handleClickDropDown}>
                            {branches.length === 0 && <NavDropdown.Item>Loading...</NavDropdown.Item>}
                            {branches.map((branch, idx) =>
                                <NavDropdown.Item key={idx} onClick={() => handleSelectBranch(branch.branchID, branch.branch)}>
                                    {branch.branch}
                                </NavDropdown.Item>
                            )}
                        </NavDropdown>
                        {/* <Navbar.Text className="mr-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">Validation and Display Setting</Tooltip>}
                            >
                                <Button 
                                    variant="outline-secondary" 
                                    className="border-0 rounded-circle"
                                    onClick={() => setOpenValidationSettings(true)}
                                >
                                    <IoMdSettings size="22px" />
                                </Button>
                            </OverlayTrigger>
                        </Navbar.Text> */}
                        <Navbar.Text className="mr-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">{translations.fullscreen}</Tooltip>}
                            >
                                <Button
                                    variant="outline-secondary"
                                    className="border-0 rounded-circle"
                                    onClick={reqFullScreen}
                                >
                                    <GoScreenFull size="22px" />
                                </Button>
                            </OverlayTrigger>
                        </Navbar.Text>
                        <Navbar.Text className="mr-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">{translations.notif}</Tooltip>}
                            >
                                <Button
                                    variant="outline-secondary"
                                    className="border-0 rounded-circle"
                                    onClick={handleOpenNotiMsg}
                                >
                                    <BiMessageEdit size="22px" />
                                </Button>
                            </OverlayTrigger>
                        </Navbar.Text>
                        <Navbar.Text className="mr-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">{translations.report}</Tooltip>}
                            >
                                <Button
                                    variant="outline-secondary"
                                    className="border-0 rounded-circle"
                                    onClick={handleOpenReport}
                                >
                                    <IoMdListBox size="22px" />
                                </Button>
                            </OverlayTrigger>
                        </Navbar.Text>
                        <Navbar.Text className="mr-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">{translations.return}</Tooltip>}
                            >
                                <Button
                                    variant="outline-primary"
                                    className="border-0 rounded-circle"
                                    onClick={() => window.open("/realtime", "_blank")}
                                >
                                    <TiHome size="22px" />
                                </Button>
                            </OverlayTrigger>
                        </Navbar.Text>
                        <Navbar.Text>
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">{translations.signOut}</Tooltip>}
                            >
                                <Button variant="outline-danger" className="border-0 rounded-circle" onClick={() => setOpenLogOut(true)}><GoSignOut size="22px" /></Button>
                            </OverlayTrigger>
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <ModalValidationConfig
                show={openValidationSettings}
                onHide={() => setOpenValidationSettings(false)}
            />
            <ModalNotiSettings
                show={openNotificationSettins}
                onHide={() => setOpenNotificationSettins(false)}
            />
            <ModalReport
                show={openReport}
                onHide={() => setOpenReport(false)}
                branch={selectedBranchID}
                branchName={selectedBranch}
                importExportRight={importExportRight}
            />
            <ModalLogout
                show={openLogOut}
                onHide={() => setOpenLogOut(false)}
            />
        </React.Fragment>
    );
}