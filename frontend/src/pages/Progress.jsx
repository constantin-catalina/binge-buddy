import React from 'react'
import BlurCircle from '../components/BlurCircle'

const Progress = () => {
  return (
    <div className='relative my-40 mb-20 px-6 md:px-16 lg:px-40 xl:px-20
        overflow-hidden min-h-[80vh]'>
      <BlurCircle top="120px" left="-60px" />
      <BlurCircle bottom="80px" right="-40px" />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold">Progress</h1>
      </div>
    </div>
  )
}

export default Progress