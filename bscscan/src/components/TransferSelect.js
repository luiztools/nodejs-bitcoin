/**
 * props:
 * - default
 * - onChange
 */
 function TransferSelect(props) {
    return (
        <select className="form-select" id="token" onChange={props.onChange}>
            <option value={props.default}>BNB</option>
            <option value="0x53598858bC64f5f798B3AcB7F82FF2CB2aF463bf">Others</option>
        </select>
    )
}

export default TransferSelect;