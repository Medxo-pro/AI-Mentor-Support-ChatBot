'use client'

import { Box, Button, Stack, TextField, IconButton } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { Star, StarBorder } from '@mui/icons-material'; // Import MUI star icons
import './globals.css'; 


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'an AI support assistant. My goal is to help you find and get a CS internship. How can I help you today?"
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')  // State to store feedback
  const [rating, setRating] = useState(0); // State to store star rating



  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }

    setIsLoading(false)
  }

  const sendFeedback = async () => {
    if (!feedback.trim() && !rating) return;
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback, rating }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      setFeedback('');
      setRating(0); 
      alert('Thank you for your valued feedback! ⭐️');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send feedback. Please try again later.');
    }
  
    setIsLoading(false);
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundImage: 'url(/background1.jpg)', backgroundSize: 'cover' }}
    >
      <h1 className="multicolor-text">Tech Mentor AI</h1>

      <Stack
        direction={'column'}
        width={{ xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' }}
        height={{ xs: '80vh', sm: '70vh', md: '65vh', lg: '60vh' }}
        border="2px solid dark purple"
        borderRadius={8}
        p={2}
        spacing={3}
        overflow="hidden"
        sx={{
          boxShadow: '0px 4px 20px rgba(255, 105, 180, 0.5), 0px 0px 10px rgba(128, 0, 128, 0.3)', // Adjust the blur and color as needed
          mb: 4, 
          mt: 4, 
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'transparent',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'rgba(30, 144, 255, 0.2)'  // Semi-transparent blue for assistant messages
                    : 'rgba(156, 39, 176, 0.2)' // Semi-transparent purple for user messages
                }
                color="white"
                borderRadius={16}
                p={3}
                >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} >
          <TextField
            label="I want to intern @ Google?"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#1876d2', // Border color when the field is not focused
                },
                '&:hover fieldset': {
                  borderColor: '#1876d2', // Border color when the field is hovered
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1876d2', // Border color when the field is focused
                },
              },
              '& .MuiInputLabel-root': {
                color: '#1876d2', // Label color
              },
              '& .MuiInputBase-input': {
                color: '#1876d2', // Input text color
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            className="button glowing-border"
            sx={{
              fontSize: '2em', // Ensure this matches the CSS font-size
              backgroundColor: 'transparent', // Override default background color
              border: '2px solid #fff', // Match the CSS border
              color: '#fff', // Match the CSS text color
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
      <Stack
        direction={'column'}
        width={{ xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' }}
        height="100px" // Set a fixed height for the bottom stack
        border="2px solid dark purple"
        borderRadius={8}
        p={2}
        spacing={3}
        alignItems="center"
        sx={{
          boxShadow: '0px 4px 20px rgba(255, 105, 180, 0.5), 0px 0px 10px rgba(128, 0, 128, 0.3)',
        }}
        >
        <Stack direction={'row'} spacing={2} >
        <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            sx={{ borderRadius: 1, p: 1 }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setRating(star)}
                sx={{
                  color: star <= rating ? '#ffb400' : '#ccc', // Set star color based on rating
                }}
              >
                {star <= rating ? <Star /> : <StarBorder />}
              </IconButton>
            ))}
          </Box>
        <Box className="feedback-glow-container">
        <TextField
          label="Send us your feedback"
          fullWidth
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isLoading}
          borderRadius={8}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#10153a', // Border color when the field is not focused
              },
              '&:hover fieldset': {
                borderColor: '#10153a', // Border color when the field is hovered
              },
              '&.Mui-focused fieldset': {
                borderColor: '#10153a', // Border color when the field is focused
              },
            },
            '& .MuiInputLabel-root': {
              color: '#1876d2', // Label color
            },
            '& .MuiInputBase-input': {
              color: '#1876d2', // Input text color
            }
          }}
        />
      </Box>
          <Button 
            variant="contained" 
            onClick={sendFeedback}
            disabled={isLoading}
            className="button-feedback glowing-border-feedback"
            sx={{
              fontSize: '1em', // Ensure this matches the CSS font-size
              backgroundColor: 'transparent', // Override default background color
              border: '2px solid #fff', // Match the CSS border
              color: '#fff', // Match the CSS text color
            }}
            >
            {isLoading ? 'Sending...' : '.        ⭐️        .'}
          </Button>
        </Stack>
        </Stack>
    </Box>
  )
}


