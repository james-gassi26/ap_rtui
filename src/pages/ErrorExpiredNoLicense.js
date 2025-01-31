import React from 'react';
import { Redirect } from 'react-router-dom';
import { Col, Container, Image, Row } from 'react-bootstrap';

import ap_sorry from "../assets/images/AP_Sticker_Sorry.png"

import { validLicense } from '../utilities/LocalStorageItems';
import { redirectTo } from '../utilities/SessionStorageItems';

export default function ErrorExpiredNoLicense(){

    if(validLicense === 1) {
        return <Redirect to={redirectTo ? redirectTo : "/realtime"} />
    }

    return(
        <Container fluid>
            <div className="position-relative w-100" style={{height: "500px"}}>
                <div className="center-vertical-horizontal w-100">
                    <Row className="justify-content-center">
                        <Col xs="5" sm="3" lg="3" xl="2">
                            <Image src={ap_sorry} width="200" height="200"/>
                        </Col>
                        <Col xs="10" sm="6" lg="5" xl="3">
                            <h1 className="mt-3">Invalid License</h1>
                            <p>Asset Pro license is either expired or no license found.</p>
                            <p>Please contact Asset Pro support.</p>
                        </Col>
                    </Row>
                </div>
            </div>
        </Container> 
    );
}