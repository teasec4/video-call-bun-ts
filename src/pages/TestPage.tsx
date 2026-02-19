import { getOrCreateClientId } from "@/utils/uuid";
import { useState } from "react";

export function TestPage() {
  const [inputRoomId, setInputRoomId] = useState("");
  const [clientId] = useState(() => getOrCreateClientId())
  console.log(`generated clientId ${clientId}`)
  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex-col">
          <div>
            <p> your ID: {clientId}</p>
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="Paste room Id here"
              style={{
                borderColor: 'gray',
                backgroundColor: 'gray'
              }}
              className="w-full px-4 py-2 rounded border"
            />
          </div>
          <div>
            <button
              onClick={() => { console.log('btn clicked') }}
              style={{backgroundColor:'green', color:'white'}}
              className="w-full py-3 rounded-lg "
            >
              Join Room
            </button>
          </div>
        </div>
      
      </div>
    </>
  )
}