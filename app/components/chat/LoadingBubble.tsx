'use client'

import { Box, Text, HStack, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const loadingStates = [
  { message: 'Analyzing your request...', duration: 1000 },
  { message: 'Identifying intent...', duration: 1500 },
  { message: 'Mapping actions...', duration: 1000 },
  { message: 'Generating response...', duration: 1500 },
]

export default function LoadingBubble() {
  const [currentState, setCurrentState] = useState(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const cycleStates = (index: number) => {
      if (index < loadingStates.length) {
        timeoutId = setTimeout(() => {
          setCurrentState(index)
          cycleStates(index + 1)
        }, loadingStates[index].duration)
      }
    }

    cycleStates(0)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <Box
      bg="white"
      p={3}
      borderRadius="md"
      maxW="80%"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <HStack spacing={3}>
        <Spinner size="sm" />
        <Text color="gray.600">
          {loadingStates[currentState].message}
        </Text>
      </HStack>
    </Box>
  )
}
