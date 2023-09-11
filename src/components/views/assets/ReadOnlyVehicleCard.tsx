import React from 'react'
import {Button, Card } from 'react-bootstrap'
import { VehicleData } from '../../../utils/ParseUtils'
import { ScopeReference } from '../../Utils'
import { exponent } from '../../../utils/Constants'
import { useNavigate } from 'react-router-dom'

interface VehicleCardProps {
    data: VehicleData
}
const ReadOnlyVehicleCard = (props :VehicleCardProps) => {

    const navigate = useNavigate()

    return (
        <Card className = ''>
            <Card.Img variant="top" src={props.data.vehicleImages[0]} />
            <Card.Body>
                <Card.Title> <ScopeReference hexString={props.data.address} type='address'/></Card.Title>
                <Card.Text>
                    Started Auction: {props.data.isStart ? 'Yes' : 'No'}
                    <br/>
                    Starting Price: {Number(props.data.startingPrice) / exponent} KLAY
                </Card.Text>
                <Button onClick={() => navigate(`/contracts/${props.data.address}`)} variant="primary"> Details </Button>
            </Card.Body>
        </Card>
    )
}

export default ReadOnlyVehicleCard