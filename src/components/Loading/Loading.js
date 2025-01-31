import React from 'react';
import { Spinner } from 'react-bootstrap';

function Loading(props) {
    return(
        <div className="d-flex justify-content-center p-5">
            <Spinner 
                animation="border" 
                variant="primary" 
                role="status" 
                className="mr-2"
                style={{width: "3rem", height: "3rem"}}
            >
                <span className="sr-only">Loading...</span>
            </Spinner>
            {/* commenting below for seamless loading */}
            <p className="mt-2">{props.msg ? props.msg : "Loading Asset Pro Interface..."}</p>
        </div>
    );
}

export default Loading;