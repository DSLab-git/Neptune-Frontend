'use client'

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { firestore } from '../firebase/firebase'
import { GenerateResponse } from '../api/RunAssistant'

import chatGPTLogo from '@/app/public/ChatGPTLogo.png'
import { Message } from '@/typing'

type Props = {
  chatId: string
}

function ChatInput({ chatId }: Props) {
  const { data: session } = useSession()
  const [prompt, setPrompt] = useState('')
  const [loading, setIsLoading] = useState(true)

  const askQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // Check for prompt and session
      if (!prompt && !session) return

      // Trim input and clear prompt
      const input = prompt.trim()
      setPrompt('')

      // Create Message object to save to firebase
      const message: Message = {
        text: input,
        createdAt: serverTimestamp(),
        user: {
          name: session?.user?.name!,
          email: session?.user?.email!,
          avatar:
            session?.user?.image ||
            `https://ui-avatars.com/api/?name=${session?.user?.name!}`,
        },
      }

      // Save Message to firebase
      await addDoc(
        collection(
          firestore,
          `users/${session?.user?.email!}/chats/${chatId}/messages`,
        ),
        message,
      )

      // loading logic
      setIsLoading(false)
      const notification = toast.loading('NeptuneGPT is thinking...')

      // just call the Assistant functionality normally without an API
      try {
        const response = await GenerateResponse({
          session,
          chatId,
          prompt: input,
        })
        console.log('respsonse: ', response)
        // Create message for the DB
        const message: Message = {
          text: response || 'NeptuneGPT unable to answer that!',
          createdAt: serverTimestamp(),
          user: {
            name: 'NeptuneGPT',
            email: 'NeptuneGPT',
            avatar: chatGPTLogo.src,
          },
        }
        // Add message to DB
        await addDoc(
          collection(
            firestore,
            `users/${session?.user?.email!}/chats/${chatId}/messages`,
          ),
          message,
        )
        toast.success('NeptuneGPT has responded!', {
          id: notification,
        })
      } catch (error: any) {
        console.log('GEN RESP ERROR:', error.message)
        toast.error('NeptuneGPT unable to respond!', {
          id: notification,
        })
      }

      setIsLoading(true)
    } catch (error: any) {
      console.log('ASK QUESTION ERROR:', error.message)
    }
  }

  return (
    <div className="px-8">
      <div className="flex justify-center items-center ">
        <div className="border-2 border-[var(--color-bg-white)] bg-[var(--color-bg-quaternary)] text-[var(--color-bg-black)] rounded-3xl text-base  mb-4">
          <form onSubmit={askQuestion} className="px-4 py-3 space-x- flex">
            <input
              type="text"
              placeholder="Enter a topic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!session}
              className={`md:min-w-[600px] placeholder:text-[var(--color-text-gray-200)] text-[var(--color-bg-white)]  bg-transparent focus:outline-none flex-1 disabled:cursor-not-allowed disabled:text-gray-300 ${
                !loading && 'animate-pulse'
              }`}
            />

            {loading ? (
              <button
                type="submit"
                disabled={!prompt || !session}
                className="hover:opacity-70 text-white font-bold px-3 py-2 rounded-lg bg-[var(--color-bg-quaternary)] disabled:bg-[var(--color-bg-black)] disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 -rotate-45"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!session}
                className="bg-[var(--color-bg-black)] hover:opacity-70 text-white font-bold px-3 py-2 rounded-lg disabled:bg-[var(--color-bg-primary)] disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
