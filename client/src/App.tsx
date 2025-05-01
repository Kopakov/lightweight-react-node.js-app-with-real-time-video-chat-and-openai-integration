import { useState } from 'react'
import VideoChat from './components/VideoChat'
import Chat from './components/Chat'

function App() {
  const [sessionId] = useState(1) // In a real app, this would come from the backend
  const [userId] = useState(1) // In a real app, this would come from authentication

  return (
    <div className="bg-gray-100">
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
          <div className="bg-white p-6 w-full flex flex-col h-full">
            <VideoChat sessionId={sessionId} />
          </div>
          <div className="bg-white p-6 w-full flex flex-col h-full">
            <Chat sessionId={sessionId} userId={userId} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
