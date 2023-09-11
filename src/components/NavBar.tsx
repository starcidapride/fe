import React, { useContext, useState } from 'react'
import { Navbar, Container, Offcanvas, Nav, Button } from 'react-bootstrap'
import Web3 from 'web3'
import { ApplicationContext, WalletInfo } from '../App'
import axios from 'axios'
import { Link } from 'react-router-dom'
const NavBar = () => {

    const applicationContext = useContext(ApplicationContext) 
    const walletInfo = applicationContext?.walletInfo as WalletInfo

    const connectWallet = applicationContext?.connectWallet as () => Promise<void>
    return (
        <div>
            <Navbar key={undefined} expand={false} className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="#"> FutureV </Navbar.Brand>
                    <Nav className="d-flex flex-row me-auto">
                        <Link to="/" className="nav-link pe-3">Home</Link>
                        <Link to="/stats" className="nav-link pe-3">Stats</Link>
                        <Link to="/contracts" className="nav-link pe-3">Contracts</Link>
                        <Link to="/assets" className="nav-link pe-3">Assets</Link>
                    </Nav>
                    <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${false}`} />
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand-${false}`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-${false}`}
                        placement="end"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${false}`} >
                      FutureV
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            {
                                walletInfo == null ? 
                                    (<Button onClick = {connectWallet}> Connect Wallet </Button>) 
                                    : (
                                        <Nav className="justify-content-end flex-grow-1 pe-3">
                                            <a  
                                                className='text-center'
                                                style={{ textDecoration: 'none' }}
                                                href = {`https://baobab.scope.klaytn.com/account/${walletInfo?.address}`}> 
                                                {`${walletInfo?.address?.slice(0, 4)}...${walletInfo?.address?.slice(-4)}`}
                                            </a>
                                            <p className = 'h5 text-center'>
                                                {(Number(walletInfo?.balance) / Math.pow(10, 18))} KLAY ({(Number(walletInfo?.usd) * Number(walletInfo?.balance) / Math.pow(10, 18)).toFixed(2)} $)
                                            </p>
                                            <Button> Disconnect </Button>
                                        </Nav>
                                    )
                            }           
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </div>
    )
}

export default NavBar
