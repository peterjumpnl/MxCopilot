'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  VStack,
  Input,
  Button,
  Card,
  CardBody,
  Heading,
  useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function Configure() {
  const [pat, setPat] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    loadCurrentKeys()
  }, [])

  const loadCurrentKeys = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        if (data.hasKeys) {
          setPat(data.pat)
          setOpenaiKey(data.openaiKey)
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load current API keys',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pat, openaiKey }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'API keys updated successfully',
          status: 'success',
        })
        router.push('/')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update API keys',
        status: 'error',
      })
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <Container maxW="container.md" py={20}>
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg">Configure API Keys</Heading>
            <Input
              placeholder="Mendix PAT Token"
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
            />
            <Input
              placeholder="OpenAI API Key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <Button
              colorScheme="blue"
              width="full"
              onClick={handleSubmit}
              isDisabled={!pat || !openaiKey}
            >
              Save Changes
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}
