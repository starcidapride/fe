import React from 'react'
import { Image } from 'react-bootstrap'
const Home = () => {
    return  <div className='w-100' style={{ position: 'relative' }}>
        <div style={{ overflow: 'hidden', height: '30rem' }}>
            <Image className='w-100' fluid src='imgs/Background.jpg' />
        </div>
    </div>
}

export default Home
