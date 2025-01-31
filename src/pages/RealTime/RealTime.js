import React, { useEffect, useState, useContext } from 'react';
import { Redirect, useHistory } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';

//PAGES
import SelectPortal from './SelectPortal';
import RealtimeTable from './RealtimeTable';

//COMPONENTS
import ModalPicture from '../../components/Modals/ModalPicture';
import { ErrMsg, InfoMsg } from '../../components/AlertMsg/AlertMsg';
import ModalSQLDependecyErr from '../../components/Modals/ModalSQLDependencyErr';
// import ModalErrMsg from '../../components/Modals/ModalErrMsg';

//UTILITY
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage'
import { counterOfReload } from '../../utilities/CounterOfReload';
import { localStoreUserAccID as userAccID, savedPortal, reloadCounter, validLicense, isIO } from '../../utilities/LocalStorageItems';

//API
import { API_domain, API } from "../../api";

//ASSETS
// import audio from '../../assets/sounds/AssetBlocked.mp3';
import { audio } from "../../assets/base64/audioAssetBlocked";

//language
import { LanguageContext } from '../../LanguageContext';

let requestPicture = null;
let modalTitle = "";
let isRanSQLDep = false;
let ieUserRights = null;

function Realtime(props) {
    // let audioAlert = new Audio(audio);
    let history = useHistory();
    const [selectedPortal, setSelectedPortal] = useState(savedPortal ? savedPortal.split(":")[0] : "Select Portal");
    const [ingressData, setIngressData] = useState([]);
    const [egressData, setEgressData] = useState([]);
    const [totals, setTotals] = useState({
        passedIn: 0,
        blockedIn: 0,
        passedOut: 0,
        blockedOut: 0
    });
    const [modalPicShow, setModalPicShow] = useState(false);
    const [modalErrMsg, setModalErrMsg] = useState({
        show: false,
        msg: ""
    });
    const [errorOccured, setErrorOccurred] = useState(false);
    const [isChkUserRyt, setIsChkUserRyt] = useState(false);

    const { translations } = useContext(LanguageContext);
    // const [sqlDependencyErr, setSQLDependencyErr] = useState({
    //     error: false,
    //     description: ""
    // });

    // const config = {
    //     headers: { 
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //     }
    // };

    useEffect(() => {
        let timeout;

        sessionStorage.setItem("redirectTo", "/realtime");
        // if(validLicense === 1) { //commented due to the component will return null because getUserAccessRights is not executed
        if (userAccID) {
            if (isChkUserRyt) {
                //check Signed In user (every hr since there's a timer that runs every hr) if the user account is still valid
                chkIfUserStillValid();

                //to reload UI after every hour. to keep connected with SignalR
                timeout = setTimeout(() => {
                    window.location.reload();
                }, 3600000);
            } else {
                getUserAccessRights();
            }
        }
        // }
        return () => {
            clearTimeout(timeout);
        }
        // eslint-disable-next-line
    }, [isChkUserRyt]);

    useEffect(() => {
        if (validLicense === 1 && isChkUserRyt) {
            if (errorOccured) {
                let timeout;

                counterOfReload({ modalErrMsg, setModalErrMsg });

                if (Number(reloadCounter) < 3) {
                    timeout = setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }

                return () => {
                    clearTimeout(timeout);
                }
            }
        }

        // eslint-disable-next-line
    }, [isChkUserRyt, errorOccured])

    //SIGNAL R Connection
    useEffect(() => {
        if (userAccID && isChkUserRyt && validLicense === 1) { //added this conditional statement to prevent to appear the toast below when user redirect to login page
            if (selectedPortal !== "Select Portal") {
                const connection = new HubConnectionBuilder()
                    .withUrl(`${API_domain}/hubs/rtmhook?readerip=${selectedPortal}`)
                    .build();

                connection.serverTimeoutInMilliseconds = 60000;
                startSignalRConnection(connection);

                connection.onclose(() => setTimeout(startSignalRConnection(connection, 3000)));
            } else {
                toast.info(<InfoMsg msg={translations.selectPort} />);
            }

            // startSQLDependency();
        }

        return () => clearTimeout();
        // eslint-disable-next-line
    }, [isChkUserRyt, selectedPortal]);

    const startSignalRConnection = async (connection) => {
        await connection.start()
            .then(result => {
                console.clear();
                console.log("SignalR Connected.");
                getRTMData();

                connection.on('RequestData', data => {
                    getRTMData();
                });

                // connection.on('SqlDepErrPrompt', data => {
                //     console.log(data);
                //     setSQLDependencyErr({...data})
                // });

                if (modalErrMsg.msg.includes("SignalR")) {
                    setModalErrMsg({ show: false, msg: "" });
                }
            })
            .catch(e => {
                localStorage.setItem('errSignalR', JSON.stringify(`${Date().toLocaleString()} ${e}`));
                console.log('SignalR Connection failed: ', e);
                startSignalRConnection(connection);
                setModalErrMsg({ show: true, msg: `SignalR Connection failed: ${e}` });
            });
    };

    // eslint-disable-next-line
    const startSQLDependency = async () => {
        if (isRanSQLDep === false) {
            try {
                const response = await API.post(`api/sql_depservice/startsqldep`, {});
                if (response.status === 200) {
                    isRanSQLDep = true;
                }
            } catch (error) {
                if (String(error).includes('401')) {
                    // deleteDataInLocalSTorage(); do not uncomment this 
                    localStorage.setItem('errRTMSQLDep', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                    toast.error(<ErrMsg msg={translations.tokenExp} />, {
                        toastId: "toast-error-401"
                    });
                } else {
                    localStorage.setItem('errRTMSQLDep', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                    toast.error(<ErrMsg msg={translations.sqlDep} err={String(error)} />);
                    window.location.reload();
                }
            }
        }
    };

    const getRTMData = async () => {
        try {
            const response = await API.get(`api/sql_dependency/getrtmdata?readerIP=${selectedPortal}&antennas=${savedPortal.split(":")[1]}`);
            if (response.status === 200) {
                sessionStorage.setItem("reloadCounter", 0);
                let distinctIngress;
                let distinctEgress;
                if (response.data.code !== 0) {
                    if (isIO) {
                        const ingress = response.data.document.filter(({ portalTypeID }) => portalTypeID === 1);
                        distinctIngress = ingress.filter((ele, ind) => ind === ingress.findIndex(elem => elem.detectedTrackingNo === ele.detectedTrackingNo))
                        const egress = response.data.document.filter(({ portalTypeID }) => portalTypeID === 2);
                        distinctEgress = egress.filter((ele, ind) => ind === egress.findIndex(elem => elem.detectedTrackingNo === ele.detectedTrackingNo))
                    } else {
                        const distinctData = response.data.document.filter((ele, ind) => ind === response.data.document.findIndex(elem => elem.detectedTrackingNo === ele.detectedTrackingNo))
                        distinctIngress = distinctData.filter(({ portalTypeID }) => portalTypeID === 1);
                        distinctEgress = distinctData.filter(({ portalTypeID }) => portalTypeID === 2);
                    }
                    
                    const hasBlocked = response.data.document.findIndex(({ monitorStatusID }) => monitorStatusID >= 2 && monitorStatusID !== 4);

                    setIngressData([...distinctIngress]);
                    setEgressData([...distinctEgress]);

                    if (hasBlocked !== -1) {
                        playAudioAlert();
                    }
                    if (hasBlocked === -1) {
                        stopAudioAlert();
                    }
                } else {
                    setIngressData([]);
                    setEgressData([]);
                    stopAudioAlert();
                    // audioAlert.pause();
                    // audioAlert.currentTime = 0;
                }
                getRTMTotals();
            }
        } catch (error) {
            if (String(error).includes('401')) {
                // deleteDataInLocalSTorage();
                localStorage.setItem('errRTMData', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errRTMData', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg={translations.rtData} err={String(error)} />, {
                    toastId: "toast-error-rtm-data"
                });
                setModalErrMsg({ ...modalErrMsg, msg: `Get Realtime Data ${error}` })
                setErrorOccurred(true);
            }
        }
    };

    const getRTMTotals = async () => {
        try {
            const response = await API.get(`api/sql_dependency/getprocessedrtmcounts?readerIP=${selectedPortal}`);
            if (response.status === 200) {
                setTotals({ ...response.data.document });
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errRTMTotal', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errRTMTotal', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred In Getting Totals!" err={String(error)} />, {
                    toastId: "toast-error-rtm-total"
                });
                setModalErrMsg({ ...modalErrMsg, msg: `Get Realtime Totals ${error}` })
                setErrorOccurred(true);
            }
        }
    };

    const getUserAccessRights = async () => {
        try {
            const response = await API.get(`api/tbl_useracc/getusermodulactionsname?moduleName=realtime&userAccID=${userAccID}`)
            if (response.status === 200) {
                ieUserRights = response.data.document;
                let ieViewUserRights = ieUserRights ? ieUserRights.find(({ actionTitle }) => actionTitle === "View") : [];

                if (ieViewUserRights.allowed === true) {
                    setIsChkUserRyt(true);
                } else {
                    history.push("/error403")
                }
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetUserRights', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errGetUserRights', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Getting Access Rights" err={String(error)} />);
            }
        }
    };

    const chkIfUserStillValid = async () => {
        try {
            const response = await API.post(`api/tbl_useracc/checkcessionacct?userAccID=${userAccID}`, {})
            if (response.status === 200) {
                if (response.data.code === 0) {
                    localStorage.removeItem('userAccID');
                    window.location.reload();
                }
            }
        } catch (error) {
            console.log(error);
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errChkIfUserStillValid', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errChkIfUserStillValid', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                // window.location.reload();
            }
        }
    };

    const handleOpenModalPic = (picURL, desc) => {
        requestPicture = picURL;
        modalTitle = desc;
        setModalPicShow(true);
    };

    const handleOnSelectPortal = (event) => {
        const portal = event.target.value;
        const ipAddress = portal.split(":");
        setSelectedPortal(ipAddress[0]);
        localStorage.setItem('portal', JSON.stringify(event.target.value));
        localStorage.setItem('i/o', JSON.stringify(String(event.target.options[event.target.selectedIndex].text).includes("I/O")));
        window.location.reload();
    };

    const chkIfSavedPortalIsExisting = (portals) => {
        //to check if the saved portal in localStorage is still existing in database
        if (savedPortal) {
            const index = portals.findIndex(({ readerIP }) => readerIP === savedPortal);
            if (index === -1) {
                setSelectedPortal("Select Portal");
                localStorage.removeItem("portal");
                window.location.reload();
            };
        }
    };

    const playAudioAlert = () => {
        var alert = document.getElementById("audioAlert");
        alert.play();
    };

    const stopAudioAlert = () => {
        var alert = document.getElementById("audioAlert");
        alert.pause();
        alert.currentTime = 0;
    };

    // invalid license
    if (validLicense === 0) {
        return <Redirect to='/expired_no_license' />
    }
    // has not yet logged in (trying to bypass the login)
    else if (!userAccID) {
        return <Redirect to='/' />
    }
    // has no rights to access this page
    else if (!isChkUserRyt) {
        //can't do Redirect due to the initial value is false. 
        //Hence, UI will be redirected immediately and no chance to check the rights.
        return null;
    }

    else {
        return (
            <React.Fragment>
                <SelectPortal selected={selectedPortal} onSelect={handleOnSelectPortal} chkportal={chkIfSavedPortalIsExisting} />
                <Container fluid>
                    {/* <div className="realtime-body"> */}
                    <Row>
                        <Col md={6}>
                            {/* INGRESS */}
                            <RealtimeTable direction= {translations.in} rtmData={ingressData} onClickPic={handleOpenModalPic} totals={totals} />
                        </Col>
                        <Col md={6}>
                            {/* EGRESS */}
                            <RealtimeTable direction={translations.out} rtmData={egressData} onClickPic={handleOpenModalPic} totals={totals} />
                        </Col>
                    </Row>
                    <ModalPicture
                        show={modalPicShow}
                        onHide={() => setModalPicShow(false)}
                        picture={requestPicture}
                        title={modalTitle}
                    />
                    {/* <ModalErrMsg
                        show={modalErrMsg.show}
                        errMsg={modalErrMsg.msg}
                    /> */}
                    <ModalSQLDependecyErr
                        show={modalErrMsg.show}
                        setShow={setModalErrMsg}
                        isCritical={true}
                        errMsg={modalErrMsg.msg}
                    />
                    {/* <ModalSQLDependecyErr 
                        show={sqlDependencyErr.description.length > 0}
                        isCritical={sqlDependencyErr.error}
                        errMsg={sqlDependencyErr.description}
                    /> */}
                    <audio id="audioAlert">
                        <source src={audio}></source>
                        Your browser does not support the audio element.
                    </audio>
                    {/* </div> */}
                </Container>
            </React.Fragment>
        );
    }
}

export default Realtime;