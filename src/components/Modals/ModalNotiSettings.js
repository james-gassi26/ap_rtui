import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { API } from '../../api';

import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage';

import { ErrMsg, SuccessMsg } from '../AlertMsg/AlertMsg';
import { LanguageContext } from '../../LanguageContext';

function ModalNotiSettings(props) {
    const { show, onHide } = props;

    const { translations } = useContext(LanguageContext);

    const [validated, setValidated] = useState(false);
    const [noticeRemarks, setNoticeRemarks] = useState({
        highRisk: "",
        oddDoor: "",
        highRiskNOddDoor: ""
    })

    useEffect(() => {
        if (show) {
            getNoticeRemarks();
        }
    }, [show])

    const getNoticeRemarks = async () => {
        try {
            const response = await API.get(`api/NoticeBuilder/getallnoticeremarks`)
            if (response.status === 200) {
                if (response.data.code > 0) {
                    setNoticeRemarks(response.data.document)
                }
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errGetNoticeRemarks', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errGetNoticeRemarks', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Getting Notice Remarks" err={String(error)} />);
            }
        }
    }

    const updateNoticeRemarks = async () => {
        try {
            const response = await API.post(`api/NoticeBuilder/updatenoticeremarks`, noticeRemarks)
            if (response.status === 200) {
                toast.success(<SuccessMsg msg="Messages updated!" />);
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errUpdateNoticeRemarks', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errUpdateNoticeRemarks', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Updating Notice Remarks" err={String(error)} />);
            }
        }

    }

    const onCloseClearData = () => {
        setValidated(false);
        onHide();
    }

    const handleOnChangeRemarks = (event) => {
        const { id, value } = event.target;
        const data = noticeRemarks;

        data[id] = value.slice(0, 66);

        setNoticeRemarks({ ...data });
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            updateNoticeRemarks();
        }

        setValidated(true);
    };

    if (!show) {
        return null;
    }

    return (
        <Modal
            show={show}
            size="md"
            animation={true}
            backdrop="static"
            onHide={onCloseClearData}
            aria-labelledby="contained-modal-title-vcenter"
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{translations.notifMess}</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group controlId="highRisk">
                        <Form.Label>{translations.forHigh}</Form.Label>
                        {/* <Form.Control as="textarea" rows={2} value={noticeRemarks.highRisk} onChange={handleOnChangeRemarks} required /> */}
                        <Form.Control as="textarea" rows={2} value={translations.aRisk} onChange={handleOnChangeRemarks} required />
                        <Form.Control.Feedback type="invalid">
                            This field is required
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="oddDoor">
                        <Form.Label>{translations.forRes}</Form.Label>
                        <Form.Control as="textarea" rows={2} value={translations.aRes} onChange={handleOnChangeRemarks} required />
                        <Form.Control.Feedback type="invalid">
                            This field is required
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="highRiskNOddDoor">
                        <Form.Label>{translations.prompt}</Form.Label>
                        <Form.Control as="textarea" rows={2} value={translations.aHigh} onChange={handleOnChangeRemarks} required />
                        <Form.Control.Feedback type="invalid">
                            This field is required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">{translations.apply}</Button>
                    <Button variant="secondary" onClick={onCloseClearData}>{translations.close}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

ModalNotiSettings.propTypes = {
    onHide: PropTypes.func.isRequired,
}

export default ModalNotiSettings;

