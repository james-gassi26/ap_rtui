 import React, { useContext } from 'react';
import { useMediaQuery } from 'react-responsive'
import { Card, Col, Container, Row } from 'react-bootstrap';
import { LanguageContext } from '../../LanguageContext';

export default function StatisticCard({ tally }) {
    const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 })
	const isLandscape = useMediaQuery({ orientation: 'landscape' })
    const { translations } = useContext(LanguageContext);

    return (
        <Container fluid>
            <Card className="border-0 shadow my-4" >
                <Card.Body className="statistic-card-body">
                    <Row>
                        <Col sm="6" md={isLandscape ? "3" : "6"} lg="3" className="border-r-lighten-3">
                            <div className="float-left pl-2">
                                <span className="font-stat-count font-weight-bold text-success">{tally.passedIn}</span>
                            </div>
                            <div className="float-left mt-4 ml-3">
                                <span className="d-block font-stat-title">{translations.assetIn}</span>
                                <span className="d-block font-stat-sub-title text-success">{translations.totalPassed}</span>
                            </div>
                        </Col>
                        <Col sm="6" md={isLandscape ? "3" : "6"} lg="3" 
                            className={(isTabletOrMobile && (!isLandscape)) 
                                ? "border-0" 
                                : "border-r-lighten-3"
                            }
                        >
                            <div className="float-left pl-2">
                                <span className="font-stat-count font-weight-bold text-danger">{tally.blockedIn}</span>
                            </div>
                            <div className="float-left mt-4 ml-3">
                                <span className="d-block font-stat-title">{translations.assetIn}</span>
                                <span className="d-block font-stat-sub-title text-danger">{translations.totalBlocked}</span>
                            </div>
                        </Col>
                        <Col sm="6" md={isLandscape ? "3" : "6"} lg="3" className="border-r-lighten-3">
                            <div className="float-left pl-2">
                                <span className="font-stat-count font-weight-bold text-success">{tally.passedOut}</span>
                            </div>
                            <div className="float-left mt-4 ml-3">
                                <span className="d-block font-stat-title">{translations.assetOut}</span>
                                <span className="d-block font-stat-sub-title text-success">{translations.totalPassed}</span>
                            </div>
                        </Col>
                        <Col sm="6" md={isLandscape ? "3" : "6"} lg="3">
                            <div className="float-left pl-2">
                                <span className="font-stat-count font-weight-bold text-danger">{tally.blockedOut}</span>
                            </div>
                            <div className="float-left mt-4 ml-3">
                                <span className="d-block font-stat-title">{translations.assetOut}</span>
                                <span className="d-block font-stat-sub-title text-danger">{translations.totalBlocked}</span>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}