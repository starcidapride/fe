import { Address } from 'web3'

export const parseVehicleData = (data: any) : VehicleData => {
    return {
        isStart: data.isStart,
        address: data.vehicleAddress.toString(),
        props: {
            ownerFullName: data.props.ownerFullName.toString(),
            ownerAddress: data.props.ownerAddress.toString(),
            brand: data.props.brand.toString(),
            vehicleType: data.props.vehicleType.toString(),
            color: data.props.color.toString(),
            seatCapacity: Number.parseInt(data.props.seatCapacity.toString()),
            origin: data.props.origin.toString(),
            licensePlate: data.props.licensePlate.toString(),
            engineNumber: data.props.engineNumber.toString(),
            chassisNumber: data.props.chassisNumber.toString(),
            modelCode: data.props.modelCode.toString(),
            capacity: Number.parseInt(data.props.capacity.toString()),
            firstRegistrationDate: data.props.firstRegistrationDate.toString()
        },
        startingPrice: data.startingPrice.toString(),
        vehicleImages: data.vehicleImages
    }
} 

export const parseAuctionRound = (data: any) : AuctionRound => {
    return {
        index: Number(data.index),
        auctioneer: data.auctioneer.toString(),
        auctionRoundDate: data.auctionRoundDate.toString(),
        quantity: data.quantity.toString(),
        isWithdrawed: data.isWithdrawed
    }
} 

export type VehicleData = {
    isStart: boolean
    address: Address
    props: VehicleProperties
    startingPrice: string
    vehicleImages: string[]
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

export type AuctionRound = {
    index: number,
    auctioneer: Address
    quantity: string
    auctionRoundDate: string,
    isWithdrawed: boolean
}
