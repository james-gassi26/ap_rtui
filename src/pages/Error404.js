import React from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';

import ap_sorry from "../assets/images/AP_Sticker_Sorry.png"

export default function Error404Page(){
    return(
        <Container fluid>
            <div className="position-relative w-100" style={{height: "800px"}}>
                <div className="center-vertical-horizontal w-100">
                    <Row className="justify-content-center">
                        <Col xs="5" sm="3" lg="3" xl="2">
                            <Image src={ap_sorry} width="200" height="200"/>
                        </Col>
                        <Col xs="10" sm="6" lg="5" xl="3">
                            <h1 className="mt-3">404 - Page Not Found</h1>
                            <p>The page you are looking for might have been removed, had its name changed or is temporarily not available.</p>
                            <p>Please contact Asset Pro Hotline.</p>
                        </Col>
                    </Row>
                </div>
            </div>
        </Container> 
    );
}