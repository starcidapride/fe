import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAuctionRounds, getIsOwner, getOwner, getVehicleData, isApproved, submitAuction, withdrawAuctionRound } from '../contracts/VehicleContract'
import { AuctionRound, VehicleData } from '../utils/ParseUtils'
import { Carousel, Col, Row, Image, Container, ListGroup, InputGroup, Form, FloatingLabel, Button, Table } from 'react-bootstrap'
import { AuctionStatus, ScopeReference } from '../components/Utils'
import Web3, { Address } from 'web3'
import { exponent } from '../utils/Constants'
import { ApplicationContext, WalletInfo } from '../App'
import {BsFillPersonVcardFill, BsCoin} from 'react-icons/bs'
import RegisterAuctionModal from '../components/RegisterAuctionModal'
import NotificationAlert, { AlertInfo, NotificationAlertRef } from '../components/NotificationAlert'

const ContractDetails = () => {
    const { address } = useParams()
    const [data, setData] = useState<VehicleData | null>(null)
    const [auctionRounds, setAuctionRounds] = useState<AuctionRound[] | null>(null)
    const [owner, setOwner] = useState<Address | null>(null)
    const [isOwner, setIsOwner] = useState<boolean>(true)

    const applicationContext = useContext(ApplicationContext)
    const walletInfo = applicationContext?.walletInfo
    const web3 = applicationContext?.web3 as Web3
    const setWalletInfo = applicationContext?.setWalletInfo as React.Dispatch<React.SetStateAction<WalletInfo | null>>

    useEffect(() => {
        if (walletInfo) {
            const handleEffect = async () => {
                const xxx = await isApproved(address as Address)
                console.log(xxx)
                console.log(walletInfo)
                const data = await getVehicleData(address as string)
                setData(data)

                const auctionRounds = await getAuctionRounds(address as string)
                console.log(auctionRounds)
                setAuctionRounds(auctionRounds)

                const owner = await getOwner(address as string)

                setOwner(owner)

                if (walletInfo && walletInfo != null){
                    console.log(walletInfo.address)
                    const isOwner = await getIsOwner(address as string, walletInfo.address)
                    setIsOwner(isOwner)
                }
            }
            handleEffect()
        }
    }, [walletInfo])

    const renderImages = () => {
        const images: JSX.Element[] = []
        data?.vehicleImages.forEach(element =>
            images.push( <Carousel.Item>
                <Image thumbnail  src = {element}/>
            </Carousel.Item> ))
        return images
    } 

    const renderTable = () => {
        const rows: JSX.Element[] = []
        auctionRounds?.forEach(element =>
            rows.push(
                <tr>
                    <td> {element.index} </td>
                    <td> <ScopeReference hexString={element.auctioneer} type='address'/> </td>
                    <td> {Number(element.quantity) / exponent} KLAY </td>
                    <td> {new Date(Number(element.auctionRoundDate as string)).toLocaleString()}</td>
                    <td> {element.isWithdrawed ? 'Yes' : 'No'}</td>
                </tr>
            ) )
        return rows
    }

    const notificationRef = useRef<NotificationAlertRef>(null)
    const enableShow = (alert: AlertInfo) =>  (notificationRef.current as NotificationAlertRef).setShow(alert)

    return <div>
        <Container fluid className='mt-3'> 
            <NotificationAlert ref={notificationRef}/>
            <Row> 
                <Col xl = {6}>
                    <Carousel className='mb-3'>
                        {renderImages()}
                    </Carousel>
                    
                    <div>
                        <p className='h5'>Auction Results</p>
                        
                        <div className='mb-2 d-flex align-items-center'>
                            <BsCoin size={24} className='me-2'/>  {Number(data?.startingPrice as string) / exponent} KLAY
                        </div>
                        <Table bordered responsive>
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Auctioneer</th>
                                    <th>Quantity</th>
                                    <th>Time</th>
                                    <th>Withdrawed</th>
                                </tr>
                            </thead>
                            
                            {
                                auctionRounds?.length == 0 ?  
                                    <tbody>              
                                        <tr>
                                            <td colSpan={5} className='text-center'> No matching records found </td>     
                                        </tr>
                                    </tbody>
                                    :
                                    <tbody>
                                        {renderTable()}
                                    </tbody>
                            }
                            
                        </Table>
                        {!isOwner && data?.isStart ? <div className='d-flex'>
                            <RegisterAuctionModal 
                                contractAddress={address as Address} 
                                enableShow = {enableShow} 
                                auctionRounds = {auctionRounds as AuctionRound[]}
                                startingPrice = {data.startingPrice as string}
                                setAuctionRounds = {setAuctionRounds}
                                className='me-3'
                            />
                            <Button variant='secondary' 
                                onClick={async () => 
                                {
                                    const receipt = await withdrawAuctionRound(
                                        web3, 
                                address as Address,
                                walletInfo?.address as Address)

                                    enableShow({
                                        hasShow: true,
                                        variant: 'success',
                                        content: <div>An auction has been withdrawed. Transaction hash: {<ScopeReference 
                                            hexString = {receipt.transactionHash as string}
                                            type='transaction'/>}</div>
                                    })

                                    const newBalance = await web3.eth.getBalance((walletInfo as WalletInfo).address)
                                    setWalletInfo({ 
                                        address: (walletInfo as WalletInfo).address, 
                                        balance: newBalance, 
                                        usd: (walletInfo as WalletInfo).usd 
                                    })

                                    const auctionRounds = await getAuctionRounds(address as Address)
                                    setAuctionRounds(auctionRounds)
                                }
                                }
                                disabled = {auctionRounds?.length == 0}
                            > Withdraw </Button>
                        </div> : <div> </div>}   
                        {isOwner && data?.isStart ? <div className='d-flex'>
                            <Button variant='primary' 
                                onClick={async () => 
                                {
                                    const receipt = await submitAuction(
                                        web3, 
                                address as Address,
                                walletInfo?.address as Address)

                                    enableShow({
                                        hasShow: true,
                                        variant: 'success',
                                        content: <div>An auction has been submitted. Transaction hash: {<ScopeReference 
                                            hexString = {receipt.transactionHash as string}
                                            type='transaction'/>}</div>
                                    })

                                    const data = await getVehicleData(address as Address)
                                    setData(data)

                                    const owner = await getOwner(address as Address)
                                    setOwner(owner)

                                    const auctionRounds = await getAuctionRounds(address as Address)
                                    setAuctionRounds(auctionRounds)
                                }
                                }
                            > Submit </Button>
                        </div> : <div> </div>} 
                                     
                    </div>
                </Col>
                <Col xl = {6}>
                    <div className='mb-2'>
                        <ScopeReference 
                            hexString={address as Address} 
                            className='h4' 
                            type='address'/>
                    
                    </div>
                    
                    <AuctionStatus className='mb-2' type= {data?.isStart as boolean}/>
                    
                    {
                        owner != null ?  <div className='mb-3 d-flex text-align-center'> <BsFillPersonVcardFill size={24} className='me-2'/> <ScopeReference 
                            hexString={owner as Address} 
                            type='address'/>
                        </div> : <div> </div>
                    }
                   
                    <ListGroup className='mb-3'>
                        <ListGroup.Item><b>Owner Full Name: </b>{data?.props.ownerFullName}</ListGroup.Item>
                        <ListGroup.Item><b>Owner Address: </b>{data?.props.ownerAddress}</ListGroup.Item>
                        <ListGroup.Item><b>Brand: </b>{data?.props.brand}</ListGroup.Item>
                        <ListGroup.Item><b>Vehicle Type: </b>{data?.props.vehicleType}</ListGroup.Item>
                        <ListGroup.Item><b>Color: </b>{data?.props.color}</ListGroup.Item>
                        <ListGroup.Item><b>Seat Capacity: </b>{data?.props.seatCapacity}</ListGroup.Item>
                        <ListGroup.Item><b>Origin: </b>{data?.props.origin}</ListGroup.Item>
                        <ListGroup.Item><b>License Plate: </b>{data?.props.licensePlate}</ListGroup.Item>
                        <ListGroup.Item><b>Engine Number: </b>{data?.props.engineNumber}</ListGroup.Item>
                        <ListGroup.Item><b>Chassis Number: </b>{data?.props.chassisNumber}</ListGroup.Item>
                        <ListGroup.Item><b>Model Code: </b>{data?.props.modelCode}</ListGroup.Item>
                        <ListGroup.Item><b>Capacity: </b>{data?.props.capacity}</ListGroup.Item>
                        <ListGroup.Item><b>First Registration Date: </b>{new Date(Number(data?.props.firstRegistrationDate as string)).toLocaleDateString()}</ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    </div>
}
export default ContractDetails
