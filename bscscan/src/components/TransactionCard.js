/**
 * props:
 * - data
 */
function TransactionCard(props) {
    return (
        <div className="card result">
            <div className="card-body">
                {
                    Object.keys(props.data).map(key => (
                        <p key={key + "" + Date.now()}>
                            <b>{key}: </b>
                            {props.data[key]}
                        </p>
                    ))
                }
            </div>
        </div>
    )
}

export default TransactionCard;