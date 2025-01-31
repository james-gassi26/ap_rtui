import React from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { FaInfo, FaCheckCircle } from 'react-icons/fa';

export const ErrMsg = ({msg, err}) => {
    return(
        <div>
            <BsExclamationCircleFill className="mr-3 mb-2" size="22px"/>{msg} 
            {err && 
                <>
                    <br /> <br /> 
                    {err}
                </>
            }
        </div>
    );
};

export const InfoMsg = ({msg}) => {
    return(
        <div>
            <FaInfo className="mr-3 mb-2" size="22px"/>{msg}
        </div>
    );
};

export const SuccessMsg = ({msg}) => {
    return(
        <div>
            <FaCheckCircle className="mr-3 mb-2" size="22px"/>{msg}
        </div>
    );
};