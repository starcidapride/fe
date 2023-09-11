import Web3, {Address, Transaction, TransactionReceipt } from 'web3'
import abi from '../abi/VehicleFactoryContractAbi'
import { gas, gasPrice } from '../utils/Constants'
import { VehicleData, parseVehicleData } from '../utils/ParseUtils'
import { getHttpWeb3 } from './Web3Utils'

const getVehicleFactoryContract = (web3: Web3) => {
    return new web3.eth.Contract(abi, process.env.REACT_APP_VEHICLE_FACTORY_CONTRACT_ADDRESS)
}

export const createVehicle = async (
    web3: Web3,
    fromAddress: Address,
    props: VehicleProperties,
    startingPrice: string,
    vehicleImages: string[],
) : Promise<TransactionReceipt> => {
    const data = getVehicleFactoryContract(web3).methods.createVehicle(
        props,
        startingPrice,
        vehicleImages
    ).encodeABI()

    return await web3.eth.sendTransaction({
        from: fromAddress,
        to: process.env.REACT_APP_VEHICLE_FACTORY_CONTRACT_ADDRESS,
        gasPrice,
        gas,
        data    
    })
}

export const getOwnedDeployedVehicleDatas = async (
    web3: Web3,
    address: Address
) : Promise<VehicleData[]> => {
    const datas = await getVehicleFactoryContract(web3).methods.getOwnedDeployedVehicleDatas(address).call()
    return datas.map(data => parseVehicleData(data))
}

export const getDeployedVehicleDatas = async (
) : Promise<VehicleData[]> => {
    const datas = await getVehicleFactoryContract(getHttpWeb3()).methods.getDeployedVehicleDatas().call()
    return datas.map(data => parseVehicleData(data))
}

export type VehicleProperties = {
    ownerFullName: string
    ownerAddress: string
    brand: string
    vehicleType: string
    color: string
    seatCapacity: number
    origin: string
    licensePlate: string
    engineNumber: string
    chassisNumber: string
    modelCode: string
    capacity: number 
    firstRegistrationDate: string 
  }