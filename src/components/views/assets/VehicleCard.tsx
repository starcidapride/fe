import React, { useContext, useState } from 'react'
import {Button, Card, Form} from 'react-bootstrap'
import { VehicleData } from '../../../utils/ParseUtils'
import { ScopeReference } from '../../Utils'
import { exponent } from '../../../utils/Constants'
import { setStart } from '../../../contracts/VehicleContract'
import { ApplicationContext, WalletInfo } from '../../../App'
import Web3 from 'web3'
import { useNavigate } from 'react-router-dom'

interface VehicleCardProps {
    data: VehicleData
}
const VehicleCard = (props :VehicleCardProps) => {
    
    const applicationContext = useContext(ApplicationContext)
    const web3 = applicationContext?.web3 as Web3
    const walletInfo = applicationContext?.walletInfo as WalletInfo
    const setWalletInfo = applicationContext?.setWalletInfo as React.Dispatch<React.SetStateAction<WalletInfo | null>>

    const [isChecked, setIsChecked] = useState(props.data.isStart)

    const navigate = useNavigate()

    const handleChecked = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked
        try{
            await setStart(web3, props.data.address, walletInfo.address, newValue)
            setIsChecked(newValue)

            const newBalance = await web3.eth.getBalance(walletInfo.address)
            setWalletInfo({ 
                address: walletInfo.address, 
                balance: newBalance, 
                usd: walletInfo.usd 
            })
        } catch (e){
            //
        }
    }
    return (
        <Card className = ''>
            <Card.Img variant="top" src={props.data.vehicleImages[0]} />
            <Card.Body>
                <Card.Title> <ScopeReference hexString={props.data.address} type='address'/></Card.Title>
                <Card.Text>
                    <div className='d-flex'>
                        <div className='me-2'> Start Auction: </div> <Form.Check // prettier-ignore
                            checked = {isChecked}
                            type="switch"
                            id="custom-switch"
                            label=""
                            onChange={event => handleChecked(event)}
                        />
                    </div>
                    Starting Price: {Number(props.data.startingPrice) / exponent} KLAY
                </Card.Text>
                <Button onClick={() => navigate(`/contracts/${props.data.address}`)} variant="primary"> Details </Button>
            </Card.Body>
        </Card>
    )
}

export default VehicleCard