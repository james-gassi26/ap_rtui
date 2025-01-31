import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Table, Image} from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaLaptop } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs'

import NoData from "../../components/NoData/NoData";
import { LanguageContext } from '../../LanguageContext';

function RealtimeTable(props) {
    const { direction, rtmData, totals, onClickPic } = props;

    const { translations } = useContext(LanguageContext);

    return(
        <div className="mt-3">
            <div className="d-flex">
                <h5 className="mt-1 mr-3 flexgrow-1">{direction} {direction === translations.in ? <FaArrowDown /> : <FaArrowUp />}</h5>
                    <h5 className="mt-1">{translations.asOf}</h5>
                <button type="button" className="btn-total btn btn-success p-1 ml-3">
                    <small className="font-weight-bold mr-1">{translations.total}</small>
                    <span className="badge badge-light">{direction === translations.in ? totals.passedIn : totals.passedOut}</span>
                </button>
                <button type="button" className="btn-total btn btn-danger p-1 ml-3">
                    <small className="font-weight-bold mr-1">{translations.totalBlock}</small>
                    <span className="badge badge-light">{direction === translations.in ? totals.blockedIn : totals.blockedOut }</span>
                </button>
            </div>
            <div className="realtime-tbl-bg rounded mt-3">
                <Table>
                    <thead>
                        <tr className="text-white">
                            <th className="border-top-0">{translations.img}</th>
                            <th className="border-top-0">{translations.assetDesc}</th>
                            <th className="border-top-0">{translations.trackID}</th>
                            <th className="border-top-0">{translations.assigned}</th>
                            <th className="border-top-0">{translations.rfid}</th>
                            <th className="border-top-0">{translations.ver}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rtmData.length > 0 && rtmData !== null
                            ? rtmData.map((data, idx) => {
                                let bgColor = data.monitorStatusID === 1 
                                                ? "bg-success text-white" 
                                                : data.monitorStatusID === 4
                                                    ? "bg-info text-black"
                                                    : "bg-danger text-white"
                                return (
                                    <tr key={idx} className={bgColor}>
                                        {/* ASSET IMAGE */}
                                        <td 
                                            className="text-center" 
                                            onClick={() => onClickPic(data.assetMediaBin, data.assetDescription)}
                                        >
                                            {data.assetMediaBin 
                                                ? <Image src={`data:image/jpeg;base64,${data.assetMediaBin}`} width="25px" height="25px" className="bg-white" roundedCircle fluid/>
                                                : <FaLaptop size="25px" />
                                            }
                                        </td>
                                        {/* ASSET DESC */}
                                        <td className="pb-0">
                                            <span className="d-inline-block text-truncate" style={{maxWidth: "120px"}}>
                                                {data.assetDescription}
                                            </span>
                                        </td>
                                        {/* TRACKING NO */}
                                        <td className="pb-0">
                                            <span className="d-inline-block text-truncate" style={{maxWidth: "120px"}}>
                                                {data.detectedTrackingNo}
                                            </span>
                                        </td>
                                        {/* PERSONNEL IMAGE */}
                                        <td 
                                            className="text-center" 
                                            onClick={() => onClickPic(data.imageByte, data.personnel_RFID)}
                                        >
                                            {data.imageByte 
                                                ? <Image src={`data:image/jpeg;base64,${data.imageByte}`} width="25px" height="25px" className="bg-white" roundedCircle fluid/>
                                                : <BsPersonFill size="25px" />
                                            }
                                        </td>
                                        {/* PERSONNEL RFID */}
                                        <td className="pb-0">
                                            <span className="d-inline-block text-truncate" style={{maxWidth: "120px"}}>
                                                {data.personnel_RFID}
                                            </span>
                                        </td>
                                        {/* VERIFICATION */}
                                        <td></td>
                                    </tr>
                                )
                            })
                            : <NoData />
                        }
                    </tbody>
                </Table>
            </div>
            <div className="mt-2 float-right">
                <p>{`${translations.show} ${rtmData.length} ${translations.res}`}</p>
            </div>
        </div>
    );
}

RealtimeTable.propTypes = {
    direction: PropTypes.oneOf(['Ingress', 'Egress']).isRequired,
    rtmData: PropTypes.array.isRequired,
    onClickPic: PropTypes.func.isRequired
}

export default RealtimeTable;