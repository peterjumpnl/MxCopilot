'use client'

import {
  VStack,
  HStack,
  Box,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  Radio,
  ModalFooter,
  Tag,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { ChatMessage, SmartReply } from '@/app/types/chat'
import LoadingBubble from './LoadingBubble'
import ReactMarkdown from 'react-markdown'

interface Feedback {
  id: string
  message: string
  timestamp: string
  type: 'info' | 'warning' | 'error' | 'success'
}

const AVAILABLE_MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Good balance of speed and capability' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model, but slower and more expensive' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Latest GPT-4 model with improved capabilities' },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    toast({
      title: 'Model Updated',
      description: `Switched to ${AVAILABLE_MODELS.find(m => m.id === modelId)?.name}`,
      status: 'success',
      duration: 3000,
    })
    onClose()
  }

  const handleSuggestedResponse = (response: string) => {
    setInputMessage(response)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          model: selectedModel
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        smartReply: data.smartReply
      }])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response from AI',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack spacing={4} w="full">
      {/* Feedback Section */}
      <Box w="full">
        {feedback.map((item) => (
          <Card key={item.id} mb={2} variant="outline">
            <CardBody>
              <Text color={item.type === 'error' ? 'red.500' : 
                        item.type === 'warning' ? 'orange.500' :
                        item.type === 'success' ? 'green.500' : 'blue.500'}>
                {item.message}
              </Text>
            </CardBody>
          </Card>
        ))}
      </Box>

      {/* Chat Messages */}
      <Box w="full" h="60vh" overflowY="auto" borderRadius="md" p={4}>
        {messages.map((message, index) => (
          <VStack
            key={index}
            align={message.role === 'assistant' ? 'start' : 'end'}
            spacing={2}
            mb={4}
          >
            <Box
              bg={message.role === 'user' ? 'blue.100' : 'white'}
              p={3}
              borderRadius="md"
              maxW="80%"
              className="markdown-content"
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <Text mb={2}>{children}</Text>,
                    ul: ({ children }) => <Box as="ul" pl={4} mb={2}>{children}</Box>,
                    ol: ({ children }) => <Box as="ol" pl={4} mb={2}>{children}</Box>,
                    li: ({ children }) => <Box as="li" mb={1}>{children}</Box>,
                    h1: ({ children }) => <Text fontSize="2xl" fontWeight="bold" mb={2}>{children}</Text>,
                    h2: ({ children }) => <Text fontSize="xl" fontWeight="bold" mb={2}>{children}</Text>,
                    h3: ({ children }) => <Text fontSize="lg" fontWeight="bold" mb={2}>{children}</Text>,
                    code: ({ children }) => (
                      <Box
                        as="code"
                        bg="gray.100"
                        p={1}
                        borderRadius="sm"
                        fontFamily="mono"
                      >
                        {children}
                      </Box>
                    ),
                    pre: ({ children }) => (
                      <Box
                        as="pre"
                        bg="gray.100"
                        p={2}
                        borderRadius="md"
                        overflowX="auto"
                        fontFamily="mono"
                        mb={2}
                      >
                        {children}
                      </Box>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <Text>{message.content}</Text>
              )}
            </Box>

            {/* Show suggested responses for assistant messages */}
            {message.role === 'assistant' && message.smartReply?.suggestedResponses && (
              <Wrap spacing={2} justify="flex-start">
                {message.smartReply.suggestedResponses.map((suggestion, i) => (
                  <WrapItem key={i}>
                    <Tag
                      size="md"
                      variant="subtle"
                      colorScheme="blue"
                      cursor="pointer"
                      onClick={() => handleSuggestedResponse(suggestion)}
                      _hover={{ bg: 'blue.100' }}
                    >
                      {suggestion}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

            {/* Show recognized intent for assistant messages */}
            {message.role === 'assistant' && message.smartReply?.actions[0].type !== 'UNKNOWN' && (
              <Tag size="sm" colorScheme="purple">
                Intent: {message.smartReply?.actions[0].type}
              </Tag>
            )}
          </VStack>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <VStack align="start" spacing={2} mb={4}>
            <LoadingBubble />
          </VStack>
        )}

        {/* Invisible div for scrolling */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <VStack w="full" spacing={2}>
        <HStack spacing={2} w="full">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </HStack>
        
        {/* Model Info */}
        <HStack w="full" justify="flex-end">
          <Text 
            fontSize="sm" 
            color="gray.500" 
            cursor="pointer" 
            onClick={onOpen}
            _hover={{ color: 'blue.500' }}
          >
            Model: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
          </Text>
        </HStack>
      </VStack>

      {/* Model Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select AI Model</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup value={selectedModel} onChange={handleModelChange}>
              <VStack align="start" spacing={4}>
                {AVAILABLE_MODELS.map((model) => (
                  <Radio key={model.id} value={model.id}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{model.name}</Text>
                      <Text fontSize="sm" color="gray.600">{model.description}</Text>
                    </VStack>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
