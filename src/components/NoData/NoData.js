import React, { useContext }  from 'react';
// import { Image } from 'react-bootstrap';

// import logo from '../../assets/images/ap_new_logo.png';
import { LanguageContext } from '../../LanguageContext';
function NoData(props) {
    const { translations } = useContext(LanguageContext);
    return(
        <tr>
            <td className="text-center bg-transparent p-5" colSpan={6}>
                {/* <Image src={logo} fluid /> */}
                <p className="text-white mt-3">{translations.noData}</p>
            </td>
        </tr>
    );
}

export default NoData;