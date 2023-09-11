import React, { useContext, useEffect, useRef, useState } from 'react'
import { Container, Row, Col, Button, InputGroup, Form } from 'react-bootstrap'
import CreateVehicleModal from '../components/CreateVehicleModal'
import NotificationAlert, { AlertInfo, NotificationAlertRef } from '../components/NotificationAlert'
import { getOwnedDeployedVehicleDatas } from '../contracts/VehicleFactoryContract'
import { ApplicationContext, WalletInfo } from '../App'
import {Web3} from 'web3'
import { VehicleData } from '../utils/ParseUtils'
import VehicleCard from '../components/views/assets/VehicleCard'

const Assets = () => {
    const applicationContext = useContext(ApplicationContext)
    const walletInfo = applicationContext?.walletInfo as WalletInfo
    const web3 = applicationContext?.web3 as Web3

    const [vehicleDatas, setVehicleDatas] = useState<VehicleData[] | null>(null)

    useEffect(() => {
        const handleEffect = async () => {
            const datas = await getOwnedDeployedVehicleDatas(web3, walletInfo.address)
            setVehicleDatas(datas)
        }
        handleEffect()
    }, [vehicleDatas]
    )

    const notificationRef = useRef<NotificationAlertRef>(null)
    const enableShow = (alert: AlertInfo) =>  (notificationRef.current as NotificationAlertRef).setShow(alert)
    
    const renderVehicleDatas = () => {
        const displayVehicleDatas: JSX.Element[] = []
        const _vehicleDatas = vehicleDatas as VehicleData[]
      
        if (_vehicleDatas == null || _vehicleDatas.length === 0) return <div></div>
      
        _vehicleDatas.forEach((vehicleData, index) =>
            displayVehicleDatas.push(
                <Col xl = {3}>
                    <VehicleCard key={index} data={vehicleData} />
                </Col>
            )
        )
      
        return displayVehicleDatas
    }
    return <div className='mt-3'>
        <Container fluid>
            <NotificationAlert 
                ref={notificationRef}    
            />
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
                    <CreateVehicleModal enableShow = {enableShow}/>            
                </Col>
                <Col xl = {10} md = {10} xs = {10} xxl = {10}>
                    <Row>
                        {renderVehicleDatas()}
                    </Row>
                </Col>
            </Row>        

        </Container>
    </div>
}

export default Assets
