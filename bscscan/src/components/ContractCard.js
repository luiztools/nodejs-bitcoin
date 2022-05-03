import { useEffect, useState } from 'react';

/**
 * props:
 * - data
 */
function ContractCard(props) {

    const [data, setData] = useState();

    useEffect(() => {
        console.log(props.data);
        setData(props.data ? props.data[0] : {});
    }, [props.data])

    return (
        <div className="card result">
            <div className="card-body">
                <div className="card-header ">
                    <h4>Contract</h4>
                </div>
                <div className="mt-3">
                    {
                        data && Object.keys(data).map(key => (
                            <p key={key + "" + Date.now()}>
                                <b>{key}: </b>
                                {data[key]}
                            </p>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default ContractCard;