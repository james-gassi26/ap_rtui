import React from 'react';
import PropTypes from 'prop-types';
import { Table, Image} from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaLaptop } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs'
import { HiSwitchHorizontal } from 'react-icons/hi'

import NoData from "../../components/NoData/NoData";

function RealtimeTable(props) {
    const { direction, rtmData, totals, onClickPic, onChangeTbl } = props;

    return(
        <div>
            <div className='d-flex'>
                {/* <div>
                    <HiSwitchHorizontal size="20px" className="text-success mt-2 ml-2" onClick={onChangeTbl}/>
                </div> */}
            </div>
            
            <div className="d-flex mt-2">
                <div className='d-flex flex-grow-1'>
                    <h6 className="mt-1">{direction} {direction === "Ingress" ? <FaArrowDown /> : <FaArrowUp />}</h6>
                    <button type="button" className="btn-total btn btn-success p-1 ml-3 mobileGeneralTexts" title='Passed'>
                        <small className="font-weight-bold mr-1">Total Passed</small>
                        <span className="badge badge-light">{direction === "Ingress" ? totals.passedIn : totals.passedOut}</span>
                    </button>
                    <button type="button" className="btn-total btn btn-danger p-1 ml-3 mobileGeneralTexts">
                        <small className="font-weight-bold mr-1">Total Blocked</small>
                        <span className="badge badge-light">{direction === "Ingress" ? totals.blockedIn : totals.blockedOut }</span>
                    </button>
                </div>
                <HiSwitchHorizontal size="20px" className="text-success mt-2 ml-2" onClick={onChangeTbl}/> 
            </div>
            <div className="mobileRealtimeTbl rounded mt-2">
                <Table size="sm">
                    <thead>
                        <tr className="text-white">
                            <th className="border-top-0">Image</th>
                            <th className="border-top-0">Asset Description</th>
                            <th className="border-top-0">Tracking No.</th>
                            <th className="border-top-0">Assigned To</th>
                            <th className="border-top-0">Personnel RFID</th>
                            <th className="border-top-0">Verification</th>
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
                <p style={{fontSize: "11px"}}>{`Showing ${rtmData.length} result(s)`}</p>
            </div>
        </div>
    );
}

RealtimeTable.propTypes = {
    direction: PropTypes.oneOf(['Ingress', 'Egress']).isRequired,
    rtmData: PropTypes.array.isRequired,
    onClickPic: PropTypes.func.isRequired,
    onChangeTbl: PropTypes.func.isRequired
}

export default RealtimeTable;