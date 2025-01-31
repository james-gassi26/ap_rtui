import React from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';

import ap_sorry from "../assets/images/AP_Sticker_Sorry.png"

export default function Error404Page(){
    return(
        <Container fluid>
            <div className="position-relative w-100" style={{height: "500px"}}>
                <div className="center-vertical-horizontal w-100">
                    <Row className="justify-content-center">
                        <Col xs="5" sm="3" lg="3" xl="2">
                            <Image src={ap_sorry} width="200" height="200"/>
                        </Col>
                        <Col xs="10" sm="6" lg="5" xl="3">
                            <h1 className="mt-3">403 - Forbidden</h1>
                            <p>You do not have permission to access the page.</p>
                            <p>Please contact your administrator to have an access.</p>
                        </Col>
                    </Row>
                </div>
            </div>
        </Container> 
    );
}