import React, { useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import { Container } from 'react-bootstrap';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';

//PAGES
import SelectPortal from './MobileSelectPortal';
import RealtimeTable from './MobileRealtimeTable';


//COMPONENTS
import ModalPicture from '../../components/Modals/ModalPicture';
import { ErrMsg, InfoMsg } from '../../components/AlertMsg/AlertMsg';
// import ModalSQLDependecyErr from '../../components/Modals/ModalSQLDependencyErr';
import ModalErrMsg from '../../components/Modals/ModalErrMsg';

//UTILITY
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage'
import { counterOfReload } from '../../utilities/CounterOfReload';
import { localStoreUserAccID as userAccID, savedPortal, validLicense } from '../../utilities/LocalStorageItems';
import { reloadCounter } from '../../utilities/SessionStorageItems';

//API
import { API_domain, API } from "../../api";

//ASSETS
import audio from '../../assets/sounds/AssetBlocked.mp3';

let requestPicture = null;
let modalTitle = "";
let ieUserRights = null;

function MobileRealtime(props) {
    let history = useHistory();

    const [isChkUserRyt, setIsChkUserRyt] = useState(false);
    const [selectedPortal, setSelectedPortal] = useState(savedPortal ? savedPortal.split(":")[0] : "Select Portal");
    const [ingressData, setIngressData] = useState([]);
    const [egressData, setEgressData] = useState([]);
    const [currentTbl, setCurrentTbl] = useState('in');
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
    const [animation, setAnimation] = useState('')

    useEffect(() => {
        let timeout;
        
        if (userAccID) {
            if(isChkUserRyt) {
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
        return () => {
            clearTimeout(timeout);
        }
        // eslint-disable-next-line
    }, [isChkUserRyt]);

    //when error occurred. to show the modal which displays the error after 3x error encountered
    useEffect(() => {
        if(validLicense === 1 && isChkUserRyt) {
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
                toast.info(<InfoMsg msg="Please select a portal" />);
            }

            // startSQLDependency();
        }

        return () => clearTimeout();
        // eslint-disable-next-line
    }, [isChkUserRyt, selectedPortal]);

    //to reset the style of Container.
    useEffect(() => {
        let timeout;

        timeout = setTimeout(() => {
            setAnimation('animated')
        }, 100);
        
        timeout = setTimeout(() => {
            setAnimation('animated fadeIn')
        }, 200);

        return () => {
            clearTimeout(timeout);
        }
    }, [currentTbl])

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

    const getRTMData = async () => {
        try {
            const response = await API.get(`api/sql_dependency/getrtmdata?readerIP=${selectedPortal}&antennas=${savedPortal.split(":")[1]}`);
            if (response.status === 200) {
                sessionStorage.setItem("reloadCounter", 0);
                if (response.data.code !== 0) {
                    const ingress = response.data.document.filter(({ portalTypeID }) => portalTypeID === 1);
                    const egress = response.data.document.filter(({ portalTypeID }) => portalTypeID === 2);
                    const hasBlocked = response.data.document.findIndex(({ monitorStatusID }) => monitorStatusID >= 2 && monitorStatusID !== 4);

                    setIngressData([...ingress]);
                    setEgressData([...egress]);

                    if (hasBlocked !== -1) {
                        // audioAlert.play();
                        playAudioAlert();
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
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errRTMData', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred In Getting Realtime Data!" err={String(error)} />, {
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
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
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
            if(response.status === 200){
                ieUserRights = response.data.document;
                let ieViewUserRights = ieUserRights ? ieUserRights.find(({actionTitle}) => actionTitle === "View") : [];
                
                if(ieViewUserRights.allowed === true){
                    setIsChkUserRyt(true);
                } else {
                    history.push("/error403")
                }
            }
        } catch (error) {
            if(String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetUserRights', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                }); 
            } else {
                localStorage.setItem('errGetUserRights', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Getting Access Rights" err={String(error)}/>);
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
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
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
    if(validLicense === 0) {
        return <Redirect to='/expired_no_license' />
    }
    // has not yet logged in (trying to bypass the login)
    else if(!userAccID) {
        return <Redirect to='/' />
    } 
    // has no rights to access this page
    else if(!isChkUserRyt) {
        //can't do Redirect due to the initial value is false. 
        //Hence, UI will be redirected immediately and no chance to check the rights.
        return null;
    }

    return (
        <React.Fragment>
            <SelectPortal selected={selectedPortal} onSelect={handleOnSelectPortal} chkportal={chkIfSavedPortalIsExisting} />
            <Container className={animation} fluid>
                {currentTbl === 'in'
                    ? <RealtimeTable direction="Ingress" rtmData={ingressData} onClickPic={handleOpenModalPic} totals={totals} onChangeTbl={() => setCurrentTbl('out')}/>
                    : <RealtimeTable direction="Egress" rtmData={egressData} onClickPic={handleOpenModalPic} totals={totals} onChangeTbl={() => setCurrentTbl('in')}/>
                }
                <ModalPicture
                    show={modalPicShow}
                    onHide={() => setModalPicShow(false)}
                    picture={requestPicture}
                    title={modalTitle}
                />
                <ModalErrMsg
                    show={modalErrMsg.show}
                    errMsg={modalErrMsg.msg}
                />
                <audio id="audioAlert">
                    <source src={audio} type="audio/mp3"></source>
                    Your browser does not support the audio element.
                </audio>
            </Container>
        </React.Fragment>
    );
}

export default MobileRealtime;