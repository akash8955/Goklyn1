import React from 'react'
import ServicesBanner from '../components/Services/ServicesBanner'
import Service from '../components/common/Service'
import WhoWeAre from '../components/common/WhoWeAre'
import Testimonial from '../components/common/Testimonial'
// import Meet from '../components/common/Meet'

const ServicesPage = () => {
  return (
    <div>
        <ServicesBanner/>
        <Service/>
        <WhoWeAre/>
        <Testimonial/>
        {/* <Meet/> */}
    </div>
  )
}

export default ServicesPage