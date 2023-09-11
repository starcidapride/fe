import React from 'react'
import { Alert } from 'react-bootstrap'
import {BsFillPatchCheckFill, BsFillPatchExclamationFill} from 'react-icons/bs'

interface ScopeReferenceProps {
    hexString: string,
    type: 'address' | 'transaction',
    className?: string
}

export const ScopeReference = (props: ScopeReferenceProps) => {
    const url = props.type === 'address'
        ? `https://baobab.scope.klaytn.com/address/${props.hexString}`
        : `https://baobab.scope.klaytn.com/tx/${props.hexString}`

    return (
        <Alert.Link href={url} className={props.className}>
            {props.hexString.slice(0, 4)}...{props.hexString.slice(-4)}
        </Alert.Link>
    )
}

interface AuctionStatusProps {
    type: boolean
    className?: string
}

export const AuctionStatus = (props: AuctionStatusProps) => {
    return (
        <div style = {{color: props.type ? 'green' : 'red'}} className={props.className + ' d-flex align-items-center'}> 
            {props.type ? <BsFillPatchCheckFill className='me-2' size={24}/> : <BsFillPatchExclamationFill className='me-2' size={24}/>}
            {props.type ? 'Auctioned' : 'Not auctioned'}
        </div>
    )
}