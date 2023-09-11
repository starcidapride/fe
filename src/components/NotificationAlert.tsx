import React, { forwardRef, useImperativeHandle, useState } from 'react'
import {Alert} from 'react-bootstrap'

export interface NotificationAlertRef {
    setShow: (value: AlertInfo) => void
}  

const NotificationAlert = forwardRef<NotificationAlertRef>((_, ref) => {

    const defaultValue: AlertInfo = {
        hasShow: false,
        content: <div> </div>,
        variant: 'success'
    }
    const [show, setShow] = useState<AlertInfo>(defaultValue)

    useImperativeHandle(ref, () => ({
        setShow: (value: AlertInfo) => {
            setShow(value)
        },
    }))
    
    return (
        <Alert show={show.hasShow} variant={show.variant == 
        'success' 
            ? 'success' 
            : 'danger'} 
        onClose={() => setShow(defaultValue)} dismissible>
            {show.content}
        </Alert>
    )
})

NotificationAlert.displayName = 'NotificationAlert'
export default NotificationAlert

export type AlertInfo = {
    hasShow: boolean,
    variant: 'success'|'failure'
    content: JSX.Element
}
