import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useHistory } from 'react-router';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Card, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { API_domain, API } from "../../api";

//utility
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage';
import { counterOfReload } from '../../utilities/CounterOfReload';
import { localStoreUserAccID as userAccID, reloadCounter, validLicense } from '../../utilities/LocalStorageItems';
import { sessSelectedBranchID } from '../../utilities/SessionStorageItems';

//COMPONENTS
import ModalBothPicture from '../../components/Modals/ModalBothPicture';
// import ModalErrMsg from '../../components/Modals/ModalErrMsg';
import ModalSQLDependecyErr from '../../components/Modals/ModalSQLDependencyErr';
import { ErrMsg } from '../../components/AlertMsg/AlertMsg';

//child components
import NavigationBar from './NavigationBar';
import StatisticCard from './StatisticCard';
import TableLogs from './TableLogs';

//language
import { LanguageContext } from '../../LanguageContext';

let requestPersonnelPicture = null;
let requestAssetPicture = null;
let rfidsAssetPersonnel = null;
let modalTitle = "";
let cmUserRights = null;

export default function DashboardMonitoring(props) {
    let history = useHistory();
    const searchRight = cmUserRights ? cmUserRights.find(({ actionTitle }) => actionTitle === "Search") : [];
    const notiMsgRight = cmUserRights ? cmUserRights.find(({ actionTitle }) => actionTitle === "Update") : [];
    const importExportRight = cmUserRights ? cmUserRights.find(({ actionTitle }) => actionTitle === "Import_Export") : [];
    const { translations } = useContext(LanguageContext);

    const [modalPicShow, setModalPicShow] = useState(false);
    const [tally, setTally] = useState({
        passedIn: 0,
        blockedIn: 0,
        passedOut: 0,
        blockedOut: 0
    });
    const [mdbData, setMDBData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalErrMsg, setModalErrMsg] = useState({
        show: false,
        msg: ""
    });
    const [errorOccured, setErrorOccurred] = useState(false);
    const [selectedBranchID, setSelectedBranchID] = useState(sessSelectedBranchID);
    //const [selectedBranchID, setSelectedBranchID] = useState(sessSelectedBranchID ? sessSelectedBranchID : localStoreBranchID);
    const [isChkUserRyt, setIsChkUserRyt] = useState(false);

    // let isRanSQlDep = false;

    //check current user (every hr since there's a timer that runs every hr) if the user account is still valid
    useEffect(() => {
        let timeout;
        sessionStorage.setItem("redirectTo", "/dashboard");

        if (userAccID) {
            if (isChkUserRyt) {
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
    }, [userAccID, isChkUserRyt]);

    useEffect(() => {
        if (isChkUserRyt) {
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
        if (userAccID && isChkUserRyt) {
            const connection = new HubConnectionBuilder()
                .withUrl(`${API_domain}/hubs/mdbhook`)
                .build();

            connection.serverTimeoutInMilliseconds = 60000;
            startSignalRConnection(connection);

            connection.onclose(() => setTimeout(startSignalRConnection(connection, 3000)));

            // startSQLDependency();

            return () => clearTimeout();
        }
        // eslint-disable-next-line
    }, [isChkUserRyt]);

    const startSignalRConnection = async (connection) => {
        await connection.start()
            .then(result => {
                console.clear(); //to clear the error logs from Signal R Conncection
                console.log("Dashboard SignalR Connected.");
                getMDBData();

                connection.on('RequestData', data => {
                    console.log("called.")
                    getMDBData();
                });

                if (modalErrMsg.msg.includes("SignalR")) {
                    setModalErrMsg({ show: false, msg: "" });
                }
            })
            .catch(e => {
                localStorage.setItem('errDashboardSignalR', JSON.stringify(`${Date().toLocaleString()} ${e}`));
                console.log('Dashboard SignalR Connection failed: ', e);
                startSignalRConnection(connection);
                setModalErrMsg({ show: true, msg: `SignalR Connection failed: ${e}` });
            });
    };

    const getMDBData = async () => {
        setIsLoading(true);
        try {
            const response = await API.get(`api/tbl_monitorrealtimelogs/gettoprecentmbddata?masterBranchID=${selectedBranchID}`);
            if (response.status === 200) {
                if (response.data.code !== 0) {
                    setMDBData(response.data.document);
                } else {
                    setMDBData([]);
                }
                getMDBTally();
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errMDBData', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp}/>, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errMDBData', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg={translations.dd} err={String(error)} />, {
                    toastId: "toast-error-mdb-data"
                });
                setModalErrMsg({ ...modalErrMsg, msg: `Get Dashboard Data ${error}` })
                setErrorOccurred(true);
            }
        }
    };

    const getMDBTally = async () => {
        try {
            const response = await API.get(`api/tbl_monitorrealtimelogs/getmdbtallydata?masterBranchID=${selectedBranchID}`);
            if (response.status === 200) {
                if (response.data.code !== 0) {
                    const passedIN = response.data.document.find(({ status, direction }) => status === "PASSED" && direction === "IN");
                    const blockedIN = response.data.document.find(({ status, direction }) => status === "BLOCKED" && direction === "IN");
                    const passedOUT = response.data.document.find(({ status, direction }) => status === "PASSED" && direction === "OUT");
                    const blockedOUT = response.data.document.find(({ status, direction }) => status === "BLOCKED" && direction === "OUT");

                    setTally({
                        passedIn: passedIN ? passedIN.total : 0,
                        blockedIn: blockedIN ? blockedIN.total : 0,
                        passedOut: passedOUT ? passedOUT.total : 0,
                        blockedOut: blockedOUT ? blockedOUT.total : 0
                    });
                } else {
                    setTally({
                        passedIn: 0,
                        blockedIn: 0,
                        passedOut: 0,
                        blockedOut: 0
                    })
                }
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errMDBTally', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errMDBTally', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg={translations.td} err={String(error)} />, {
                    toastId: "toast-error-mdb-totals"
                });
                setModalErrMsg({ ...modalErrMsg, msg: `Get Dashboard Totals ${error}` })
                setErrorOccurred(true);
            }
        }
    };

    const getUserAccessRights = async () => {
        try {
            const response = await API.get(`api/tbl_useracc/getusermodulactionsname?moduleName=dashboard&userAccID=${userAccID}`)
            if (response.status === 200) {
                cmUserRights = response.data.document;
                const cmViewUserRights = cmUserRights ? cmUserRights.find(({ actionTitle }) => actionTitle === "View") : [];

                if (cmViewUserRights.allowed === true) {
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
                toast.error(<ErrMsg msg={translations.ar} err={String(error)} />);
            }
        }
    }

    const chkIfUserStillValid = async () => {
        try {
            const response = await API.post(`api/tbl_useracc/checkcessionacct?userAccID=${userAccID}`, {});
            if (response.status === 200) {
                if (response.data.code === 0) {
                    localStorage.removeItem('userAccID');
                    window.location.reload();
                }
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errChkIfUserStillValid', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errChkIfUserStillValid', JSON.stringify(`${Date().toLocaleString()} ${error}`));
            }
        }
    };

    const handleOpenModalPic = async (assetRFID, personnelRFID, desc) => {
        modalTitle = desc;
        try {
            const response = await API.get(`api/tbl_monitorrealtimelogs/getassetandpersonimg?assetRFID=${assetRFID}&personnelRFID=${personnelRFID}`)
            if (response.status === 200) {
                if (response.data.code === 0) {
                    requestAssetPicture = null;
                    requestPersonnelPicture = null;
                } else {
                    rfidsAssetPersonnel = [assetRFID, personnelRFID];
                    requestAssetPicture = response.data.document.assetImage;
                    requestPersonnelPicture = response.data.document.personnelImage;
                }
                setModalPicShow(true);
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errMDBPic', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg={translations.tokenExp} />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errMDBPic', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg={translations.pp} err={String(error)} />);
                window.location.reload();
            }
        }


    };

    //not valid license
    if (validLicense === 0) {
        return <Redirect to='/expired_no_license' />
    }

    //has not yet logged in, redirect to login page
    else if (!userAccID) {
        return <Redirect to='/' />
    }

    //no rights to access this page
    else if (!isChkUserRyt) {
        //can't do Redirect due to the initial value is false. 
        //Hence, UI will be redirected immediately and no chance to check the rights.
        return null;
    }

    else {
        return (
            <React.Fragment>
                <NavigationBar
                    selectedBranchID={selectedBranchID}
                    setSelectedBranchID={setSelectedBranchID}
                    searchRight={searchRight}
                    notiMsgRight={notiMsgRight}
                    importExportRight={importExportRight}
                />
                <StatisticCard tally={tally} />
                <Container fluid>
                    <Card className="shadow">
                        <Card.Header className="bg-alice-blue">
                            <Card.Title>{translations.rtSum}</Card.Title>
                            <Card.Subtitle className="card-sub-title">{translations.click}</Card.Subtitle>
                        </Card.Header>
                        <Card.Body className="dashboard-card-body">
                            <TableLogs mdbData={mdbData} onClickPic={handleOpenModalPic} inProgress={isLoading} />
                        </Card.Body>
                    </Card>
                </Container>
                <ModalBothPicture
                    show={modalPicShow}
                    onHide={() => setModalPicShow(false)}
                    title={modalTitle}
                    personnelpicture={requestPersonnelPicture}
                    assetPicture={requestAssetPicture}
                    rfids={rfidsAssetPersonnel}
                />
                <ModalSQLDependecyErr
                    show={modalErrMsg.show}
                    setShow={setModalErrMsg}
                    isCritical={true}
                    errMsg={modalErrMsg.msg}
                />
                {/* <ModalErrMsg
                    show={modalErrMsg.show}
                    errMsg={modalErrMsg.msg}
                /> */}
            </React.Fragment>
        );
    }
}