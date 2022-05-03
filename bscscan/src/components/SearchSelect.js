/**
 * props:
 * - onChange
 */
function SearchSelect(props) {

    return (
        <select className="form-select" id="type" onChange={props.onChange}>
            <option value="1">Balance</option>
            <option value="2">Transactions</option>
            <option value="3">Contract</option>
        </select>
    )
}

export default SearchSelect;