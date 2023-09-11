import './App.css'
import React, { useState, createContext, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import NavBar from './components/NavBar'
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports'
import Web3, { Address, Contract } from 'web3'
import Auction from './pages/Contracts'
import Assets from './pages/Assets'
import initializeFirebase from './firebase'
import { IconContext } from 'react-icons'
import ContractDetails from './pages/ContractDetails'
import axios from 'axios'
import Contracts from './pages/Contracts'
import Stats from './pages/Stats'

interface ApplicationContext {
  web3: Web3<RegisteredSubscription> | null,
  setWeb3: React.Dispatch<React.SetStateAction<Web3<RegisteredSubscription> | null>>,
  walletInfo: WalletInfo | null,
  setWalletInfo: React.Dispatch<React.SetStateAction<WalletInfo | null>>,
  connectWallet: () => Promise<void>,
}

export const ApplicationContext = createContext<ApplicationContext | null>(null)
function App() {

    initializeFirebase()
    
    const [web3, setWeb3] = useState<Web3<RegisteredSubscription> | null>(null)
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)

    useEffect(() => {
        if (localStorage.getItem('address') != null){
            connectWallet()
        }
    }, [])

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                const web3 = new Web3(window.ethereum) 

                const address = (await web3.eth.getAccounts())[0]
                const balance = await web3.eth.getBalance(address)

                setWeb3(web3)

                const coinId = 'klay-token'         
                const usd = (await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
                )).data['klay-token']['usd']

                setWalletInfo({address, balance, usd})

                localStorage.setItem('address', address)
            } catch (error) {
                console.error('Error connecting to Metamask:', error)
            }
        } else {
            console.error('Metamask not detected')
        }
    }

    return (
        <div> 
            <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
                <ApplicationContext.Provider value = {{web3, setWeb3, walletInfo, setWalletInfo, connectWallet}}>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={ <Home /> } />
                        <Route path="/stats" element={ <Stats /> } />
                        <Route path="/contracts" element={ <Contracts /> } />
                        <Route path="/assets" element={ <Assets /> } />
                        <Route path="/contracts/:address" element={ <ContractDetails /> } />
                    </Routes>
                </ApplicationContext.Provider>
            </IconContext.Provider>
        </div> 
    )

}


export type WalletInfo = {
    address: Address,
    balance: bigint,
    usd: number
}

export default App

