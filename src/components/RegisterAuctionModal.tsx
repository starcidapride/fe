import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, FloatingLabel, Form, InputGroup, Modal, Row } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {BsExclamationCircle} from 'react-icons/bs'
import './index.css'
import { exponent } from '../utils/Constants'
import { ApplicationContext, WalletInfo } from '../App'
import Web3, { Address } from 'web3'
import { AlertInfo } from './NotificationAlert'
import { ScopeReference } from './Utils'
import { createAuctionRound, findNearestUnwithdrawedAuctionRound, getAuctionRounds } from '../contracts/VehicleContract'
import { AuctionRound } from '../utils/ParseUtils'

interface CreateVehicleModalProps {
    contractAddress: Address,
    enableShow: (alert: AlertInfo) => void,
    auctionRounds : AuctionRound[]
    startingPrice: string
    setAuctionRounds: React.Dispatch<React.SetStateAction<AuctionRound[] | null>>
    className? : string
}

const RegisterAuctionModal = (props: CreateVehicleModalProps) => {
    const [show, setShow] = useState(false)
    const [nearestUnwithdrawedAuctionRound, setNearestUnwithdrawedAuctionRound] = useState<AuctionRound | null>(null)
    const handleClose = () => setShow(false)
    const handleShow = () => {
        setShow(true)
        formik.resetForm()
    }

    useEffect(() => {
        if (show){
            const handleEffect = async () => {
                const nearestUnwithdrawedAuctionRound = await findNearestUnwithdrawedAuctionRound(props.contractAddress)
                console.log(nearestUnwithdrawedAuctionRound)
                setNearestUnwithdrawedAuctionRound(nearestUnwithdrawedAuctionRound)
            }
            handleEffect()
        }
    }, [show])

    const applicationContext = useContext(ApplicationContext)
    const web3 = applicationContext?.web3 as Web3
    const walletInfo = applicationContext?.walletInfo as WalletInfo
    const setWalletInfo = applicationContext?.setWalletInfo as React.Dispatch<React.SetStateAction<WalletInfo | null>>

    const formik = useFormik({
        initialValues : {
            quantity: 10,
        },
        validationSchema: Yup.object({
            quantity: Yup.number()
                .min(
                    nearestUnwithdrawedAuctionRound == null || (nearestUnwithdrawedAuctionRound as AuctionRound).isWithdrawed
                        ? (Number(props.startingPrice) / exponent)
                        : (Math.round(
                            (Number((nearestUnwithdrawedAuctionRound as AuctionRound).quantity) 
                            / exponent + 0.1 + Number.EPSILON) * 100)) / 100,
                    nearestUnwithdrawedAuctionRound == null || (nearestUnwithdrawedAuctionRound as AuctionRound).isWithdrawed
                        ? 'The quantity must equal or exceed the starting price'
                        : 'New quantity must be greater than the previous at least 0.1 KLAY'
                ).max(Math.round((Number(walletInfo.balance) / exponent - 1) * 100) / 100,
                    'The balance must be greater than the quantity at least 1 KLAY')
                .required('Quantity is required')
        }),
        onSubmit: values => {
            const handleSubmit = async () => {   
                
                const date = new Date().getTime()
                const receipt = await createAuctionRound(
                    web3,
                    props.contractAddress,
                    walletInfo.address,
                    (values.quantity * exponent).toString(),
                    date.toString()
                )

                const newBalance = await web3.eth.getBalance(walletInfo.address)
                setWalletInfo({ 
                    address: walletInfo.address, 
                    balance: newBalance, 
                    usd: walletInfo.usd 
                })

                props.enableShow({
                    hasShow: true,
                    variant: 'success',
                    content: <div>New auction has been created. Transaction hash: {<ScopeReference 
                        hexString = {receipt.transactionHash as string}
                        type='transaction'/>}</div>
                })

                props.setAuctionRounds(await getAuctionRounds(props.contractAddress))

                handleClose()
            }
            handleSubmit()
        }
    })

    return (
        <div className={props.className}>
            <Button className='' onClick={handleShow}>
          Register
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Register An Auction Round</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>      
                        <p className="h5"> Quantity </p>
                        <InputGroup>
                            <Form.Control
                                id = "quantity"
                                aria-describedby="basic-addon1"
                                type = "number"
                                defaultValue={formik.values.quantity}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <InputGroup.Text id="basic-addon1">KLAY</InputGroup.Text>
                        </InputGroup>
                        <div className='mb-3'>
                            {formik.touched.quantity && formik.errors.quantity ? (
                                <p className='validation-error'> 
                                    <BsExclamationCircle className='me-2'/> 
                                    <small> {formik.errors.quantity} </small>
                                </p>    
                            ) : null}
                        </div> 
                        <div> 
                            { nearestUnwithdrawedAuctionRound == null || (nearestUnwithdrawedAuctionRound as AuctionRound).isWithdrawed
                                ? <div> 
                                    <b>Starting Price: </b> {Number(props.startingPrice) / exponent} KLAY
                                </div>   
                                :   
                                <div> 
                                    <b>Previous Quantity: </b> {(Number((nearestUnwithdrawedAuctionRound as AuctionRound).quantity)) / exponent} KLAY
                                </div> 
                            }
                            
                        </div>   
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
              Close
                        </Button>
                        <Button variant="primary" type = "submit">
              Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
        
    )
}


export default RegisterAuctionModal
