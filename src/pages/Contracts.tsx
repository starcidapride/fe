import React, { useContext, useEffect, useState } from 'react'
import { VehicleData, parseVehicleData } from '../utils/ParseUtils'
import abi from '../abi/VehicleFactoryContractAbi'
import { getDeployedVehicleDatas } from '../contracts/VehicleFactoryContract'
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import CreateVehicleModal from '../components/CreateVehicleModal'
import ReadOnlyVehicleCard from '../components/views/assets/ReadOnlyVehicleCard'
const Contracts = () => {
    //const web3Context = useContext(Web3Context) 
    const [deployedVehicleDatas, setDeployedVehicleDatas] = useState<VehicleData[] | null>(null)

    // const getDeployedVehicleDatas = async () => {
    //     if (web3Context == null || web3Context.web3 == null) return null    
    //     const contract = new web3Context.web3.eth.Contract(abi, process.env.REACT_APP_VEHICLE_FACTORY_CONTRACT)
    //     console.log(contract)
    //     const response = await contract.methods.getDeployedVehicleDatas().call() 
    //     console.log(response.toString())  
    //     const deployedVehicleDatas: VehicleData[] = []   
    //     response.forEach(deployedVehicleData => deployedVehicleDatas.push(parseVehicleData(deployedVehicleData)))
    //     setDeployedVehicleDatas(deployedVehicleDatas)
    // }

    useEffect(() => {
        const handleEffect = async () => {
            const datas = await getDeployedVehicleDatas()
            setDeployedVehicleDatas(datas)
        }
        handleEffect()
    }, [])

    const renderVehicleDatas = () => {
        const displayVehicleDatas: JSX.Element[] = []
        const _vehicleDatas = deployedVehicleDatas as VehicleData[]
      
        if (_vehicleDatas == null || _vehicleDatas.length === 0) return <div></div>
      
        _vehicleDatas.forEach((vehicleData, index) =>
            displayVehicleDatas.push(
                <Col xl = {3}>
                    <ReadOnlyVehicleCard key={index} data={vehicleData} />
                </Col>
            )
        )
      
        return displayVehicleDatas
    }

    return <Container fluid className='mt-3'>
        <Row>
            <Col xl = {2} md = {2} xs = {2} xxl = {2}> 
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder=""
                        aria-label="Recipient's username"
                        aria-describedby="basic-addon2"
                    />
                    <Button variant="outline-secondary" id="button-addon2">
                            Search
                    </Button>
                </InputGroup>
            </Col>
            <Col xl = {10} md = {10} xs = {10} xxl = {10}>
                <Row>
                    {renderVehicleDatas()}
                </Row>
            </Col>
        </Row>        

    </Container>  
}

export default Contracts
