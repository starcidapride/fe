import React, { useContext, useState } from 'react'
import { Button, Col, FloatingLabel, Form, InputGroup, Modal, Row } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getStorage, getDownloadURL, uploadBytes, ref } from 'firebase/storage'
import {BsExclamationCircle} from 'react-icons/bs'
import './index.css'
import { createVehicle } from '../contracts/VehicleFactoryContract'
import { exponent } from '../utils/Constants'
import { ApplicationContext, WalletInfo } from '../App'
import Web3 from 'web3'
import { AlertInfo } from './NotificationAlert'
import { ScopeReference } from './Utils'

interface CreateVehicleModalProps {
    enableShow: (alert: AlertInfo) => void
}

const CreateVehicleModal = (props: CreateVehicleModalProps) => {
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => {
        setShow(true)
        formik.resetForm()
    }

    const applicationContext = useContext(ApplicationContext)
    const web3 = applicationContext?.web3 as Web3
    const walletInfo = applicationContext?.walletInfo as WalletInfo
    const setWalletInfo = applicationContext?.setWalletInfo as React.Dispatch<React.SetStateAction<WalletInfo | null>>

    const currentDate = new Date()
    const year = currentDate.getFullYear().toString()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const formik = useFormik({
        initialValues : {
            ownerFullName: 'John Doe',
            ownerAddress: '123 Main Street',
            brand: 'Toyota',
            vehicleType: 'Sedan',
            color: 'Blue',
            seatCapacity: 5,
            origin: 'USA',
            licensePlate: 'ABC-123',
            engineNumber: '123456789',
            chassisNumber: 'ABCDEFGH123456789',
            modelCode: 'XYZ123',
            capacity: 4,
            firstRegistrationDate: formattedDate,
            images: [] as File[], 
            startingPrice: 10,
        },
        validationSchema: Yup.object({
            ownerFullName: Yup.string().required('Owner Full Name is required'),
            ownerAddress: Yup.string().required('Owner Address is required'),
            brand: Yup.string().required('Brand is required'),
            vehicleType: Yup.string().required('Vehicle Type is required'),
            color: Yup.string().required('Color is required'),
            seatCapacity: Yup.number()
                .min(1, 'Seat Capacity must be at least 1')
                .required('Seat Capacity is required'),
            origin: Yup.string().required('Origin is required'),
            licensePlate: Yup.string().required('License Plate is required'),
            engineNumber: Yup.string().required('Engine Number is required'), 
            chassisNumber: Yup.string().required('Chassis Number is required'),    
            modelCode: Yup.string().required('Model Code is required'), 
            capacity: Yup.number()
                .min(1, 'Capacity must be at least 1')
                .required('Capacity is required'),
            startingPrice: Yup.number()
                .min(1, 'Starting Price must be equal or more than 1 KLAY')
                .required('Starting Price is required'),
            images: Yup.array()
                .required('Vehicle Images is required'),
        }),
        onSubmit: values => {
            console.log(values)

            const handleSubmit = async () => {
                const vehicleImageFiles = values.images
                const vehicleImages: string[] = []
                const storage = getStorage()
                
                for (let i = 0; i < vehicleImageFiles.length; i++){
                    const file = vehicleImageFiles[i]
                    const data = await file.arrayBuffer() as ArrayBuffer
                    const metadata = {
                        contentType: 'image/png',
                    }
                    const storageRef = ref(storage, `/images/${file.name}`)
                    await uploadBytes(storageRef, data, metadata)
                    vehicleImages.push(await getDownloadURL(storageRef))            
                }

                const receipt = await createVehicle(
                    web3,
                    walletInfo.address,
                    {
                        ownerFullName: values.ownerFullName,
                        ownerAddress: values.ownerAddress,
                        brand: values.brand,
                        vehicleType: values.vehicleType,
                        color: values.color,
                        seatCapacity: values.seatCapacity,
                        origin: values.origin,
                        licensePlate: values.licensePlate,
                        engineNumber: values.engineNumber,
                        chassisNumber: values.chassisNumber,
                        modelCode: values.modelCode,
                        capacity: values.capacity,
                        firstRegistrationDate: new Date(values.firstRegistrationDate).getTime().toString()
                    },
                    (values.startingPrice * exponent).toString(),
                    vehicleImages
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
                    content: <div>New contract {<ScopeReference 
                        hexString = {receipt.logs[0].address as string}
                        type='address'/>} has been created. Transaction hash: {<ScopeReference 
                        hexString = {receipt.transactionHash as string}
                        type='transaction'/>}</div>
                })
                handleClose()
            }
            handleSubmit()
        }
    })

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<File[] | null> => {
        const files = event.target.files
        if (files == null) return null
        if (files.length < 1) return null  

        const uploadedFiles: File[] = []
        for (let i = 0; i < files.length; i++){
            const file = files.item(i) as File
            try {
                uploadedFiles.push(file)
            } catch (error) {
                console.error('Error uploading image:', error)
            }
        }   
        return uploadedFiles
    }
    return (
        <div className='w-100 mb-3'>
            <Button className='w-100' onClick={handleShow}>
          Create
            </Button>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create Vehicle Contractization</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>         
                        <div>
                            <p className="h5"> Vehicle Properties </p>
                            <Row>
                                <Col lg = {4}>
                                    <FloatingLabel  
                                        label="Owner Full Name"
                                    >
                                        <Form.Control 
                                            id="ownerFullName"
                                            placeholder="" 
                                            defaultValue={formik.values.ownerFullName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.ownerFullName && formik.errors.ownerFullName ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.ownerFullName} </small>
                                        </p>    
                                    ) : null}
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Owner Address"
                                    >
                                        <Form.Control 
                                            id="ownerAddress"
                                            placeholder="" 
                                            defaultValue={formik.values.ownerAddress}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.ownerAddress && formik.errors.ownerAddress ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.ownerAddress} </small>
                                        </p>    
                                    ) : null}
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel  
                                        label="Brand"
                                    >
                                        <Form.Control 
                                            id="brand"
                                            placeholder="" 
                                            defaultValue={formik.values.brand}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.brand && formik.errors.brand ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.brand} </small>
                                        </p>    
                                    ) : null}
                                </Col>    
                            </Row>
                            <Row className = "mt-3">
                                <Col lg = {4}>
                                    <FloatingLabel
                                        
                                        label="Vehicle Type"
                                    >
                                        <Form.Control 
                                            id="vehicleType"
                                            placeholder="" 
                                            defaultValue={formik.values.vehicleType}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.vehicleType && formik.errors.vehicleType ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.vehicleType} </small>
                                        </p>    
                                    ) : null}
                                </Col>    
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Color"
                                    >
                                        <Form.Control 
                                            id="color"
                                            placeholder="" 
                                            defaultValue={formik.values.color}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.color && formik.errors.color ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.color} </small>
                                        </p>    
                                    ) : null}  
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Seat Capacity"
                                    >
                                        <Form.Control 
                                            id="seatCapacity"
                                            type="number"
                                            placeholder="" 
                                            defaultValue={formik.values.seatCapacity}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.seatCapacity && formik.errors.seatCapacity ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.seatCapacity} </small>
                                        </p>    
                                    ) : null}      
                                </Col>    
                            </Row>
                            <Row className = "mt-3">
                                <Col lg = {4}>
                                    <FloatingLabel
                                        
                                        label="Origin"
                                    >
                                        <Form.Control 
                                            id="origin"
                                            placeholder="" 
                                            defaultValue={formik.values.origin}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.origin && formik.errors.origin ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.origin} </small>
                                        </p>    
                                    ) : null} 
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel  
                                        label="License Plate"
                                    >
                                        <Form.Control 
                                            id="licensePlate"
                                            placeholder="" 
                                            defaultValue={formik.values.licensePlate}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.licensePlate && formik.errors.licensePlate ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.licensePlate} </small>
                                        </p>    
                                    ) : null} 
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel
                                        
                                        label="Engine Number"
                                    >
                                        <Form.Control 
                                            id="engineNumber"
                                            placeholder="" 
                                            defaultValue={formik.values.engineNumber}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.engineNumber && formik.errors.engineNumber ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.engineNumber} </small>
                                        </p>    
                                    ) : null} 
                                </Col>    
                            </Row>
                            <Row className = "mt-3">
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Chassis Number"
                                    >
                                        <Form.Control 
                                            id="chassisNumber"
                                            placeholder="" 
                                            defaultValue={formik.values.chassisNumber}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.chassisNumber && formik.errors.chassisNumber ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.chassisNumber} </small>
                                        </p>    
                                    ) : null}       
                                </Col>  
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Model Code"
                                    >
                                        <Form.Control 
                                            id="modelCode"
                                            placeholder="" 
                                            defaultValue={formik.values.modelCode}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.modelCode && formik.errors.modelCode ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.modelCode} </small>
                                        </p>    
                                    ) : null} 
                                </Col>
                                <Col lg = {4}>
                                    <FloatingLabel
                                        label="Capacity"
                                    >
                                        <Form.Control 
                                            id="capacity"
                                            type="number"
                                            placeholder="" 
                                            defaultValue={formik.values.capacity}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}/>
                                    </FloatingLabel>
                                    {formik.touched.capacity && formik.errors.capacity ? (
                                        <p className='validation-error'> 
                                            <BsExclamationCircle className='me-2'/> 
                                            <small> {formik.errors.capacity} </small>
                                        </p>    
                                    ) : null} 
                                </Col>
                            </Row>
                            <Row className = "mt-3">
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1">First Registration Date</InputGroup.Text>
                                    <Form.Control
                                        id="firstRegistrationDate"
                                        aria-describedby="basic-addon1"
                                        type = "date"
                                        defaultValue={formik.values.firstRegistrationDate}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </InputGroup>
                            </Row>
                        </div>
                        <div className = "mt-4">
                            <p className="h5"> Vehicle Images </p>
                            <Form.Control
                                id="images"
                                aria-describedby="basic-addon1"
                                type = "file"
                                accept="image/*"
                                multiple
                                onChange =
                                    {
                                        async (event: React.ChangeEvent<HTMLInputElement>) => {
                                            const uploadedFiles = await handleUpload(event) as File[]
                                            formik.values.images = uploadedFiles
                                        }
                                    }
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.images && formik.errors.images ? (
                                <p className='validation-error'> 
                                    <BsExclamationCircle className='me-2'/> 
                                    <small> {formik.errors.images.toString()} </small>
                                </p>    
                            ) : null} 
                        </div>
                        <div className = "mt-4">
                            <p className="h5"> Starting Price </p>
                            <InputGroup>
                                <Form.Control
                                    id="startingPrice"
                                    aria-describedby="basic-addon1"
                                    type = "number"
                                    defaultValue={formik.values.startingPrice}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}    
                                />
                                <InputGroup.Text id="basic-addon1">KLAY</InputGroup.Text>
                            </InputGroup>
                            {formik.touched.startingPrice && formik.errors.startingPrice ? (
                                <p className='validation-error'> 
                                    <BsExclamationCircle className='me-2'/> 
                                    <small> {formik.errors.startingPrice} </small>
                                </p>    
                            ) : null} 
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


export default CreateVehicleModal
