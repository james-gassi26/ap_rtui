import React, {useContext} from 'react';
import { useMediaQuery } from 'react-responsive'
import DataTable from 'react-data-table-component';
import { FaLaptop } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import { LanguageContext } from '../../LanguageContext';


const conditionalRowStyles = [
	{
		when: row => row.status === "Blocked",
		style: {
			backgroundColor: 'rgba(244, 67, 54)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	},
	{
		when: row => row.status === "Passed",
		style: {
			backgroundColor: 'rgba(67, 160, 71)',
			color: 'white',
			'&:hover': {
				cursor: 'pointer',
			},
		},
	}
];

export default function Logs({ mdbData, onClickPic, inProgress }) {
	const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 })
	const isLandscape = useMediaQuery({ orientation: 'landscape' })
	const { translations } = useContext(LanguageContext);

	const columns = [
		{
			name: '#',
			selector: row => row.count,
			sortable: true,
			maxWidth: "50px"
		},
		{
			name: translations.doorLoc,
			selector: row => <span title={row.doorDescription}>{row.doorDescription}</span>,
			sortable: true,
			minWidth: "300px"
		},
		{
			name: translations.asset,
			selector: row => <FaLaptop size="25px" />,
			maxWidth: "50px"
		},
		{
			name: translations.assetDesc,
			selector: row => <span title={row.assetDescription}>{row.assetDescription}</span>,
			sortable: true,
			minWidth: "250px"
		},
		{
			name: translations.trackID,
			selector: row => row.assetRFID,
			sortable: true,
			minWidth: "200px"
		},
		{
			name: translations.assetModel,
			selector: row => row.assetModel,
			sortable: true,
			minWidth: "200px"
		},
		{
			name: translations.serNum,
			selector: row => row.assetSerialNo,
			sortable: true,
			minWidth: "200px"
		},
		{
			name: translations.assigned,
			selector: row => <BsPersonFill size="25px" />,
			maxWidth: "50px"
		},
		{
			name: translations.rfid,
			selector: row => row.personnelRFID,
			sortable: true,
			minWidth: "180px"
		},
		{
			name: translations.branch,
			selector: row => row.assetBranch,
			sortable: true,
			maxWidth: "130px"
		},
		{
			name: translations.readDate,
			selector: row => String(row.readDate).replace("T", " "),
			sortable: true,
			maxWidth: "180px"
		},
		{
			name: translations.remarks,
			selector: row => row.remarks,
			sortable: true,
		}
	];

	const onSelectRow = (props) => {
		onClickPic(props.assetRFID, props.personnelRFID, props.assetDescription);
	}

	return (
		<DataTable
			title="Real Time Monitoring Summary Report"
			columns={columns}
			data={mdbData}
			conditionalRowStyles={conditionalRowStyles}
			noHeader
			fixedHeader
			fixedHeaderScrollHeight={(isTabletOrMobile && isLandscape) ? "305px" : "430px"}
			progressPending={inProgress}
			selectableRowsSingle
			onRowClicked={onSelectRow}
			noDataComponent={translations.noRecords}
		/>
	);
};