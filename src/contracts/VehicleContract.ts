import Web3, {Address, Transaction, TransactionReceipt } from 'web3'
import abi from '../abi/VehicleContractAbi'
import { gas, gasPrice } from '../utils/Constants'
import { AuctionRound, VehicleData, parseAuctionRound, parseVehicleData } from '../utils/ParseUtils'
import { getHttpWeb3 } from './Web3Utils'

const getVehicleContract = (web3: Web3, contractAddress: Address) => {
    return new web3.eth.Contract(abi, contractAddress)
}

export const setStart = async (
    web3: Web3,
    contractAddress: Address,
    fromAddress: Address,
    newValue: boolean
) : Promise<TransactionReceipt> => {
    const data = getVehicleContract(web3, contractAddress).methods.setStart(newValue).encodeABI()

    return await web3.eth.sendTransaction({
        from: fromAddress,
        to: contractAddress,
        gasPrice,
        gas,
        data    
    })
}

export const isApproved = async (
    contractAddress: Address,): Promise<boolean> => {
    return getVehicleContract(getHttpWeb3(), contractAddress).methods.isApproved().call()
}

export const createAuctionRound = async (
    web3: Web3,
    contractAddress: Address,
    fromAddress: Address,
    quantity: string,
    auctionRoundDate: string
) : Promise<TransactionReceipt> => {
    const data = getVehicleContract(web3, contractAddress).methods.createAuctionRound(
        quantity,
        auctionRoundDate
    ).encodeABI()

    console.log(data)

    return await web3.eth.sendTransaction({
        from: fromAddress,
        to: contractAddress,
        gasPrice,
        gas,
        data,
        value: quantity
    })
}

export const withdrawAuctionRound = async (
    web3: Web3,
    contractAddress: Address,
    fromAddress: Address
) : Promise<TransactionReceipt> => {
    const data = getVehicleContract(web3, contractAddress).methods.withdrawAuctionRound(
    ).encodeABI()

    console.log(data)

    return await web3.eth.sendTransaction({
        from: fromAddress,
        to: contractAddress,
        gasPrice,
        gas,
        data
    })
}

export const submitAuction = async (
    web3: Web3,
    contractAddress: Address,
    fromAddress: Address
) : Promise<TransactionReceipt> => {
    const data = getVehicleContract(web3, contractAddress).methods.submitAuction(
    ).encodeABI()

    console.log(data)

    return await web3.eth.sendTransaction({
        from: fromAddress,
        to: contractAddress,
        gasPrice,
        gas,
        data
    })
}

export const getVehicleData = async (
    vehicleAddress: Address
) : Promise<VehicleData> => {
    const data = await getVehicleContract(getHttpWeb3(), vehicleAddress).methods.getData().call()
    return parseVehicleData(data)
}

export const getAuctionRounds = async (
    vehicleAddress: Address
) : Promise<AuctionRound[]> => {
    const datas = await getVehicleContract(getHttpWeb3(), vehicleAddress).methods.getAuctionRounds().call()
    return datas.map(data => parseAuctionRound(data))
}

export const getIsOwner = async (
    vehicleAddress: Address,
    ownerAddress: Address
) : Promise<boolean> => {
    const data = await getVehicleContract(getHttpWeb3(), vehicleAddress).methods.isOwner(ownerAddress).call()
    return data
}

export const getOwner = async (
    vehicleAddress: Address
) : Promise<string> => {
    const data = await getVehicleContract(getHttpWeb3(), vehicleAddress).methods.owner().call()
    return data
}

export const findNearestUnwithdrawedAuctionRound = async (
    vehicleAddress: Address
): Promise<AuctionRound> => {
    const data = await getVehicleContract(getHttpWeb3(), vehicleAddress).methods.findNearestUnwithdrawedAuctionRound().call()
    return parseAuctionRound(data)
}




