import React, { useState, useEffect } from 'react'
import { SmallCard } from './cards.js'
import { SearchBar } from './search-bar.js'
import { Modal } from './modals.js'
import { useNavigate  } from 'react-router-dom'

// Wraps everything on the registry screen with style
const Wrapper = (props) => {
    return <>
    <div class="slider-container" style={{width:'100vw'}}>
        <div class="slider-wrapper">
        {props.children}
            </div>
        </div>
    
    <div class="spacer-small"></div>
    </>
    
}

const cards = [
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
]

const defaultHolo = {
    name: '',
    bio: '',
    twitter: '',
    google: '',
    github: '',
    orcid: ''
}



const Registry = (props) => {
    const getAllAddresses = async () => {
        let response = await fetch('https://sciverse.id/getAllUserAddresses')
        const addrsObj = await response.json() // TODO: try-catch. Need to catch timeouts and such
        const allAddressesByService = addrsObj['allAddrs'][props.desiredChain]
        let allAddresses = []
        for (const [service, addresses] of Object.entries(allAddressesByService)){
            allAddresses = [...new Set([...allAddresses, ...addresses])]
        }
        console.log('this ran 3')
        return allAddresses
    }

    // can optionally supply addresses to get holos from. otherwise, gets from all addresses registered on Holo:
    const getAllHolos = async (addresses) => {
        let allAddresses = addresses || (await getAllAddresses())
        console.log('WHAT IS THIS', allAddresses)
        const allHolos = allAddresses.map(async (address) => {
          const url = `http://127.0.0.1:3000/getHolo?address=${props.account}`
          const response = await fetch(url) // TODO: try-catch. Need to catch timeouts and such
          const holoData = await response.json()
          const holo_ = holoData['holo'][props.desiredChain]
          return {...defaultHolo, ...holo_.creds, 'name' : holo_.name || 'Anonymous', 'bio' : holo_.bio || 'No information provided'}
        })

        return Promise.all(allHolos)
    }

    const init = async () => {
        if(!props.provider){return}

        try{
            console.log('THIS RAN')
            let addresses = await getAllAddresses()
            console.log('ALL ADDRESSES', addresses)

            setHolos(await getAllHolos(addresses))
            // Only show the modal if the user doesn't have a Holo: 
            let address = props.address || await props.provider.getSigner().getAddress()
            if(addresses.includes(address)){setModalVisible(false)}
        } catch(err) {
            console.log('ERROR: ', err)
        }
        
    }
    const [holos, setHolos] = useState([])
    const [modalVisible, setModalVisible] = useState(true)
    useEffect(init, [props.provider])

    console.log(holos)

    const navigate = useNavigate()

    
    return <>
            <div class="x-section bg-img wf-section" style={{height:'200vw'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper fullscreen-center" style={{marginLeft:'1.5vw', marginLeft:'1.5vw'}}>
                        <h1>DeSci Community</h1>
                        <div className="x-wrapper small-center">
                            <SearchBar />
                            <div class="spacer-large"></div>
                        </div>
                        <Wrapper>
                            {holos.length ? holos.map(x => <SmallCard holo={x} />) : null}
                        </Wrapper>
                        <Modal visible={modalVisible} setVisible={()=>{}} blur={true}>
                            <h3 className="h3 white">Create your own identity to join the community</h3>
                            <div className='x-container w-container' style={{justifyContent: 'space-between'}}>
                                <a onClick={()=>navigate('/myholo')} className='x-button' style={{width: '45%'}}>Create My ID</a> 
                                <a href='https://holo.pizza' className='x-button secondary' style={{width: '45%'}}>Learn More</a>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
         </>
}
export default Registry;