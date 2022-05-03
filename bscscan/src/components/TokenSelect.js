/**
 * props:
 * - default
 * - onChange
 */
function TokenSelect(props) {
    return (
        <select className="form-select" id="token" onChange={props.onChange}>
            <option value={props.default}>BNB</option>
            <option value="0x53598858bC64f5f798B3AcB7F82FF2CB2aF463bf">BTC</option>
            <option value="0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378">ETH</option>
            <option value="0x64544969ed7EBf5f083679233325356EbE738930">USDC</option>
        </select>
    )
}

export default TokenSelect;