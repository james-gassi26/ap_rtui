import React, { useEffect, useRef, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Modal, Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import { MdFirstPage, MdLastPage, MdNavigateBefore, MdNavigateNext,  } from 'react-icons/md';
import moment from 'moment';

//api
import { API } from "../../api";
//utility
import { deleteDataInLocalSTorage } from '../../utilities/DeleteLocalStorage';
//component
import { SuccessMsg, ErrMsg, InfoMsg } from '../AlertMsg/AlertMsg';

import { LanguageContext } from '../../LanguageContext';

function ModalReport(props) {
    const { show, onHide, branch, branchName, importExportRight } = props;
    const { translations } = useContext(LanguageContext);

    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        direction: "",
        dateRead: moment(new Date()).format("YYYY-MM-DD"),
        searchKey: ""
    });
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [isBtnSending, setIsBtnSending] = useState(false);
    const [isBtnExporting, setIsBtnExporting] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        count: 0,
        pageSize: 100,
        totalPages: 1,
        indexOne: 0,
        indexTwo: 0,
        showPrevious: true,
        showFirst: true,
        showLast: true
    })
    const refRemarks = useRef("");

    useEffect(() => {
        if(show) {
            getFilteredLogs();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, pagination.currentPage, pagination.pageSize])

    const getFilteredLogs = async () => {
        const { status, direction, dateRead, searchKey } = filters;
        const { pageSize, currentPage } = pagination;

        setIsLoading(true);
        try {
            // const response = await API.get(`api/Tblmonitorrealtimelogs/getfilteredmdbdata?status=${status}&direction=${direction}&dateRead=${dateRead}&searchKey=${searchKey}`);
            const response = await API.get(`api/tbl_monitorrealtimelogs/getfilteredmdbdatapaged?masterBranchID=${branch}&status=${status}&direction=${direction}&dateRead=${dateRead}&searchKey=${searchKey}&page=${currentPage}&itemsPerPage=${pageSize}`);
            if (response.status === 200) {
                if (response.data.code === 0) {
                    setPagination({
                        currentPage: 1,
                        count: 0,
                        pageSize: 100,
                        totalPages: 1,
                        indexOne: 0,
                        indexTwo: 0,
                        showPrevious: true,
                        showFirst: true,
                        showLast: true
                    })
                    setFilteredLogs([]);
                } else {
                    setPagination(response.data.document.pagination)
                    setFilteredLogs(response.data.document.rtmRptList);
                }
                setIsLoading(false);
            }
        } catch (error) {
            if (String(error).includes('401')) {
                deleteDataInLocalSTorage();
                localStorage.setItem('errFilteredLogs', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                    toastId: "toast-error-401"
                });
            } else {
                localStorage.setItem('errFilteredLogs', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                toast.error(<ErrMsg msg="Oops! Error Occurred in Getting Filtered Logs" err={String(error)} />);
            }
        }
    }

    const sendLogsViaEmail = async () => {
        const { status, direction, dateRead, searchKey } = filters

        if(!isLoading) {
            if (filteredLogs.length > 0) {
                setIsBtnSending(true);
                try {
                    const response = await API.post(`api/tbl_monitorrealtimelogs/sendmdbrptasemail?masterBranchID=${branch}&userBranchID=${JSON.parse(localStorage.getItem('branchID'))}&status=${status}&direction=${direction}&dateRead=${dateRead}&searchKey=${searchKey}&remarks=${refRemarks.current.value}`, {});
                    if (response.status === 200) {
                        toast.success(<SuccessMsg msg="Email was successfully sent to administrators" />);
                        onCloseClearData();
                        setIsBtnSending(false);
                    }
                } catch (error) {
                    setIsBtnSending(false);
                    if (String(error).includes('401')) {
                        deleteDataInLocalSTorage();
                        localStorage.setItem('errSendEmail', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                        toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                            toastId: "toast-error-401"
                        });
                    } else {
                        localStorage.setItem('errSendEmail', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                        toast.error(<ErrMsg msg="Oops! Error Occurred in Sending Email to Administrators" err={String(error)} />);
                    }
                }
            } else {
                toast.error(<ErrMsg msg="Oops! No report to send." />);
            }
        } else {
            toast.info(<InfoMsg msg="Please wait report to finish loading." />);
        }
    }

    const exportLogsAsCSV = async () => {
        const { status, direction, dateRead, searchKey } = filters

        if(!isLoading) {
            if (filteredLogs.length > 0) {
                try {
                    setIsBtnExporting(true);
                    const response = await API.get(`api/tbl_monitorrealtimelogs/getmdbrptascsv?masterBranchID=${branch}&status=${status}&direction=${direction}&dateRead=${dateRead}&searchKey=${searchKey}`)
                    if (response.status === 200) {
                        const downloadUrl = 'data:text/csv;base64,' + response.data.document.fileContents;
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.setAttribute('download', response.data.document.fileDownloadName); //any other extension
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setIsBtnExporting(false);
                    }
                } catch (error) {
                    setIsBtnExporting(false);
                    if (String(error).includes('401')) {
                        deleteDataInLocalSTorage();
                        localStorage.setItem('errExportAsCSV', JSON.stringify(`${Date().toLocaleString()} Token Expired`));
                        toast.error(<ErrMsg msg="Token expired. Please reload this page." />, {
                            toastId: "toast-error-401"
                        });
                    } else {
                        localStorage.setItem('errExportAsCSV', JSON.stringify(`${Date().toLocaleString()} ${error}`));
                        toast.error(<ErrMsg msg="Oops! Error Occurred in Exporting Logs as CSV" err={String(error)} />);
                    }
                }
            } else {
                toast.error(<ErrMsg msg="Oops! No logs to export." />);
            }
        } else {
            toast.info(<InfoMsg msg="Please wait report to finish loading." />);
        }
    }

    const onChangeFilters = (events) => {
        const { name, value } = events.target;
        const dupFilters = filters;

        dupFilters[name] = value;
        setFilters({ ...dupFilters });

        getFilteredLogs();
    }

    const onCloseClearData = () => {
        if (isBtnExporting || isBtnSending) {
            toast.error(<ErrMsg msg="Wait! Process is not yet finished." />, {
                toastId: "toast-error-no-close"
            });
        } else {
            setFilters({
                status: "",
                direction: "",
                dateRead: moment(new Date()).format("YYYY-MM-DD"),
                searchKey: ""
            })
            setPagination({
                currentPage: 1,
                count: 0,
                pageSize: 100,
                totalPages: 1,
                indexOne: 0,
                indexTwo: 0,
                showPrevious: true,
                showFirst: true,
                showLast: true
            })
            setFilteredLogs([]);
            onHide();
        }
    }

    return (
        <Modal
            show={show}
            onHide={onCloseClearData}
            size="xl"
            animation={true}
            backdrop="static"
            aria-labelledby="contained-modal-title-vcenter"
        >
            <Modal.Header closeButton className="bg-alice-blue">
                <Modal.Title id="contained-modal-title-vcenter">{translations.assetReport} - {branchName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Filters filters={filters} funcOnChange={onChangeFilters} isLoading={isLoading}/>
                <FilteredLogsTable filteredLogsData={filteredLogs} inProgress={isLoading} />
                <TablePagination pagination={pagination} setPagination={setPagination} isLoading={isLoading}/>
                <Form.Group className="mx-1 mt-3">
                    <Form.Row>
                        <Form.Label>{translations.remarks}</Form.Label>
                        <Form.Control as="textarea" rows={3} ref={refRemarks} />
                        <Form.Text className="text-muted" >
                        {translations.maxChar}
                        </Form.Text>
                    </Form.Row>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={exportLogsAsCSV} disabled={isBtnExporting || importExportRight.allowed === false}>
                    {isBtnExporting ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="ml-1">Exporting...</span>
                        </>
                    ) : translations.export}
                </Button>
                <Button variant="primary" onClick={sendLogsViaEmail} disabled={isBtnSending || importExportRight.allowed === false}>
                    {isBtnSending ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="ml-1">Sending to administrators...</span>
                        </>
                    ) : translations.emailAdmin}
                </Button>
                <Button variant="secondary" onClick={onCloseClearData}>{translations.close}</Button>
            </Modal.Footer>
        </Modal>
    );
}

ModalReport.propTypes = {
    onHide: PropTypes.func.isRequired,
}

function Filters({ filters, funcOnChange, isLoading }) {
    const { translations } = useContext(LanguageContext);
    return (
        <Form.Row>
            <Form.Group as={Col} controlId="formGridDirection">
                <Form.Label>{translations.direction}</Form.Label>
                <Form.Control
                    as="select"
                    name="direction"
                    value={filters.direction}
                    onChange={funcOnChange}
                    size="sm"
                    disabled={isLoading}
                >
                    <option></option>
                    <option value="1">{translations.dirIN}</option>
                    <option value="2">{translations.dirOUT}</option>
                </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridStatus">
                <Form.Label>{translations.status}</Form.Label>
                <Form.Control
                    as="select"
                    name="status"
                    value={filters.status}
                    onChange={funcOnChange}
                    disabled={isLoading}
                    size="sm"
                >
                    <option></option>
                    <option value="1">{translations.passed}</option>
                    <option value="2">{translations.blocked}</option>
                </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridDateLogged">
                <Form.Label>{translations.dateLogged}</Form.Label>
                <Form.Control
                    type="date"
                    name="dateRead"
                    value={filters.dateRead}
                    onChange={funcOnChange}
                    // disabled={isLoading}
                    size="sm"
                />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridSearch">
                <Form.Label>{translations.search}</Form.Label>
                <Form.Control
                    type="text"
                    name="searchKey"
                    value={filters.searchKey}
                    onChange={funcOnChange}
                    // disabled={isLoading}
                    title="Search Door Description, Asset Tag, Asset Name, Personnel Tag, Personnel Assignee, Remarks..."
                    size="sm"
                />
            </Form.Group>
        </Form.Row>
    );
}

Filters.propTypes = {
    filters: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired
}

const columns = [
    {
        name: '#',
        selector: row => row.count,
        sortable: true,
        maxWidth: "50px"
    },
    {
        name: 'Asset Description',
        selector: row => row.assetDescription,
        sortable: true,
        minWidth: "220px"
    },
    {
        name: 'Tracking No.',
        selector: row => row.assetRFID,
        sortable: true,
        minWidth: "220px"
    },
    {
        name: 'Asset Model',
        selector: row => row.assetModel,
        sortable: true,
        minWidth: "200px"
    },
    {
        name: 'Serial No.',
        selector: row => row.assetSerialNo,
        sortable: true,
        minWidth: "200px"
    },
    {
        name: 'Passes Status',
        selector: row => row.status,
        sortable: true,
        minWidth: "130px"
    },
    {
        name: 'Read Date',
        selector: row => String(row.readDate).replace("T", " "),
        sortable: true,
        minWidth: "180px"
    },
    {
        name: 'Remarks',
        selector: row => row.remarks,
        sortable: true,
        minWidth: "220px"
    }
];

function FilteredLogsTable({ filteredLogsData, inProgress }) {
    const { translations } = useContext(LanguageContext);
    return (
        <div className="border" style={{minHeight: "250px"}}>
            <DataTable
                title="Real Time Monitoring Summary Report"
                columns={columns}
                data={filteredLogsData}
                progressPending={inProgress}
                noHeader
                fixedHeader
                fixedHeaderScrollHeight="250px"
                // pagination
                selectableRowsSingle
                noDataComponent={translations.noRecords}
            />
        </div>
    );
};

FilteredLogsTable.propTypes = {
    filteredLogsData: PropTypes.array.isRequired,
    inProgress: PropTypes.bool.isRequired
}

function TablePagination({ pagination, setPagination, isLoading }) {
    const { translations } = useContext(LanguageContext);
    const { count, currentPage, totalPages, indexOne, indexTwo } = pagination;
    const [rowPerPage, setRowPerPage] = useState("100");

    const goToFirstPage = () => !isLoading && setPagination({...pagination, currentPage: 1})

    const goToLastPage = () => !isLoading && setPagination({...pagination, currentPage: pagination.totalPages})

    const goToNextPage = () => !isLoading && setPagination({
        ...pagination, 
        currentPage: (pagination.currentPage < pagination.totalPages) 
            ? pagination.currentPage + 1 
            : pagination.totalPages
    })

    const goToPrevPage = () => !isLoading && setPagination({
        ...pagination, 
        currentPage: (pagination.currentPage > 1) 
            ? pagination.currentPage - 1 
            : 1
    })

    const handleChangePageSize = (event) => {
        if(!isLoading){
            setRowPerPage(
                event.target.value === ""
                    ? 1
                    : event.target.value > 500 
                        ? 500 
                        : event.target.value
            )
        }
    }

    const handlekeyDownPageSize = (event) => {
        if(!isLoading && event.keyCode === 13) {
            setPagination({
                ...pagination, 
                pageSize: rowPerPage
            });
        }
    }

    return (
        <div id="custom-pagination">
            <div className="w-100 d-flex mr-3 mt-1">
                <span className="mr-2">{translations.rowsPer}</span>
                <input className="form-control" value={rowPerPage} onChange={handleChangePageSize} onKeyDown={handlekeyDownPageSize}/>
                <span className="ml-3">{translations.rows} {indexOne} - {indexTwo} of {count}</span>
            </div>
            
            <div className="w-100 d-flex justify-content-end">
                <span className="ml-3 mr-4 mt-1">Page {currentPage} of {totalPages}</span>
                <MdFirstPage title="First Page" onClick={goToFirstPage} className={currentPage === 1 ? "svg-disabled" : ""}/>
                <MdNavigateBefore title="Previous Page" onClick={goToPrevPage} className={currentPage === 1 ? "svg-disabled" : ""}/>
                <MdNavigateNext title="Next Page" onClick={goToNextPage} className={currentPage === totalPages ? "svg-disabled" : ""}/>
                <MdLastPage title="Last Page" onClick={goToLastPage} className={currentPage === totalPages ? "svg-disabled" : ""}/>
            </div>
        </div>
    );
}

TablePagination.propTypes = {
    pagination: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired
}

export default ModalReport;

