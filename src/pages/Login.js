import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Image, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import logo from "../assets/images/ap_new_logo.png"
import { API } from "../api";

import { ErrMsg } from "../components/AlertMsg/AlertMsg";

//utilities
import { redirectTo } from "../utilities/SessionStorageItems"

//translations
import { LanguageContext } from '../LanguageContext';

let prevTypedUname = "";
// API.defaults.headers.common['Authorization'] = token;

function Login(props) {
    const userAccID = JSON.parse(localStorage.getItem('userAccID'));
    
    const {language, translations, changeLanguage } = useContext(LanguageContext);

    const [loginDetails, setLoginDetails] = useState({
        userName: "",
        password: "",
        retryCount: 0
    });

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        changeLanguage(selectedLanguage); 
      };

    const saveToLocalStorage = (props) => {
        const { userAccID, branchID } = props;

        localStorage.setItem("userAccID", JSON.stringify(userAccID));
        localStorage.setItem("branchID", JSON.stringify(branchID));
    };

    const handleOnChangeText = (event) => {
        const { name, value } = event.target

        setLoginDetails({
            ...loginDetails,
            [name]: value
        })
    };

    const handleSignIn = async (event) => {
        event.preventDefault();

        try {
            const response = await API.post(`api/tbl_useracc/valdiatelogin?userName=${loginDetails.userName}&password=${loginDetails.password}&retryCount=${loginDetails.retryCount}`, {});
            if(response.status === 200) {
                // wrong credentials
                if(response.data.code === 0){
                    //if same username but wrong password
                    if(loginDetails.userName === prevTypedUname) {
                        setLoginDetails({
                            ...loginDetails,
                            retryCount: loginDetails.retryCount + 1
                        });
                    } else {
                        // reset to 1 and store the new input username
                        setLoginDetails({
                            ...loginDetails,
                            retryCount: 1
                        });
                        prevTypedUname = loginDetails.userName;
                    }
                    toast.error(<ErrMsg msg={`${response.data.message}!`} />);
                } else {
                    saveToLocalStorage(response.data.document)
                    window.location.reload(true);
                }
            }
        } catch (err) {
            if(String(err).includes('401')) {
                window.location.reload();
                // deleteDataInLocalSTorage();
                // localStorage.setItem('errSignIn', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                // toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                //     toastId: "toast-error-401"
                // }); 
            } else {
                localStorage.setItem('errSignIn', JSON.stringify(`${Date().toLocaleString()} ${err}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Signing In" err={String(err)}/>);
            } 
        }
    };

    if(userAccID) {
        return <Redirect to={redirectTo ? redirectTo : "/realtime"} />
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col md={6} lg={4} xl={3}>
                    <div className="position-relative w-100" style={{height: "600px"}}>
                        <div className="center-vertical-horizontal w-100">
                            <Image src={logo} width="100%" fluid/>
                            <Form className="mt-5" onSubmit={handleSignIn}>
                                <Form.Group controlId="formUserName">
                                    <Form.Control 
                                        name="userName"
                                        size="lg" 
                                        placeholder={translations.userName} 
                                        value={loginDetails.userName}
                                        onChange={handleOnChangeText}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPassword" className="mb-4">
                                    <Form.Control 
                                        name="password"
                                        type="password" 
                                        size="lg" 
                                        placeholder={translations.pw} 
                                        value={loginDetails.password}
                                        onChange={handleOnChangeText}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" size="lg" type="submit" block>{translations.sign}</Button>

                                <div className="mt-2" >
                                    <label>Language: </label>
                                    <select value={language} onChange={handleLanguageChange}> 
                                        <option value="en">US - English</option>
                                        <option value="zh">ZH - Simplified</option>
                                    </select>
                                </div>
                            </Form>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;