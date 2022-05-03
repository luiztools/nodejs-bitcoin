import { useEffect, useState } from 'react';

/**
 * props:
 * - data
 */
function BalanceCard(props) {

    const [data, setData] = useState();

    useEffect(() => {
        console.log(props.data);
        setData(props.data);
    }, [props.data])

    return (
        <div className="card result">
            <div className="card-body">
                <div className="card-header ">
                    <h4>Balance</h4>
                </div>
                <div className="mt-3">
                    {data}
                </div>
            </div>
        </div>
    )
}

export default BalanceCard;