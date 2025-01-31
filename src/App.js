import React, { Suspense } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from 'react-responsive'

import './App.scss';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

//api
import { API } from './api';

//components
import Loading from "./components/Loading/Loading";
import { ErrMsg, InfoMsg } from "./components/AlertMsg/AlertMsg";

//utilities
import { token, token_expiration as expiry } from './utilities/LocalStorageItems';

//pages
const Error404 = React.lazy(() => import('./pages/Error404'));
const Error403 = React.lazy(() => import('./pages/Error403'));
const ErrorExpiredNoLicense = React.lazy(() => import('./pages/ErrorExpiredNoLicense'));
const Login = React.lazy(() => import('./pages/Login'));
const RealTime = React.lazy(() => import('./pages/RealTime/RealTime'));
const RealTimeMobile = React.lazy(() => import('./pages/RealTimeMobile/MobileRealTime'));
const DashboardMonitoring = React.lazy(() => import('./pages/DashboardMonitoring/DashboardMonitoring'));

function App() {
    const isMobile = useMediaQuery({ query: '(max-width: 500px)' })

    const requestAPIToken = async () => {
        try {
            const response = await API.post('api/Token', {"username": "admin", "password": "admin123"});
            if(response.status === 200) {
                localStorage.setItem('token', JSON.stringify(response.data.document.accessToken));
                localStorage.setItem('expiry', JSON.stringify(response.data.document.validTo));
            }
        } catch (error) {
            localStorage.clear();
            toast.error(<ErrMsg msg="Oops! Error Occurred In Getting Token" err={String(error)}/>);
            localStorage.setItem('errGetToken', JSON.stringify(`${Date().toLocaleString()} ${error}`));
        }
    };
     
    const chkTokenExpiration = () => {
        if(new Date() >= new Date(expiry)) {
            localStorage.clear();
            requestAPIToken().then(window.location.reload(true));
            // // window.location.reload(true);
            toast.info(<InfoMsg msg="Token expired. Please sign in again." />);
        }
    };

    const chkValidLicense = async () => {
        localStorage.setItem("validLicense", 1); // for testing purpose.
        
        // try {
        //     const response = await API.get('api/APLicense/checklocallicense');
        //     if(response.status === 200) {
        //         if(String(response.data.message).includes("expired") || String(response.data.message).includes("Failed")){
        //             localStorage.setItem("validLicense", 0);
        //         } else {
        //             localStorage.setItem("validLicense", 1);
        //         }
        //     }
        // } catch (error) {
        //     toast.error(<ErrMsg msg="Oops! Error Occurred In Checking License" err={String(error)}/>, {
        //         toastId: "toast-error-get-license"
        //     });
        //     localStorage.setItem('errCheckLicense', JSON.stringify(`${Date().toLocaleString()} ${error}`));
        // }
    };

    if(!token) {
        requestAPIToken();
    } else {
        chkTokenExpiration();
        chkValidLicense();
    }
    
    return (
        <React.Fragment>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ width: isMobile ? "380px" : "450px"}}
            />
            <Router>
                <Suspense fallback={<Loading />}>
                    <Switch>
                        <Route exact path="/error403" name="Error 403" render={props => <Error403 {...props}/>} />
                        <Route exact path="/error404" name="Error 404" render={props => <Error404 {...props}/>} />
                        <Route exact path="/expired_no_license" name="Expired or No License" render={props => <ErrorExpiredNoLicense {...props}/>} />
                        <Route exact path="/realtime" name="Real Time">
                            {window.CfgIdx === -1 //wrong config.js setup
                                ? <Redirect to="/error404" /> 
                                : isMobile
                                    ? <RealTimeMobile />
                                    : <RealTime />
                            }
                        </Route>
                        <Route exact path="/dashboard" name="Dashboard">
                            {window.CfgIdx === -1 
                                ? <Redirect to="/error404" /> //wrong config.js setup
                                : <DashboardMonitoring />
                            }
                        </Route>
                        <Route exact path="/" name="Login">
                            {window.CfgIdx === -1 
                                ? <Redirect to="/error404" /> 
                                : <Login />}
                        </Route>
                        {/* for unsupported links */}
                        <Route component={Error404} />
                    </Switch>
                </Suspense>
            </Router>
        </React.Fragment>
    );
};

export default App;
